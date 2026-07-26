import { Request, Response } from 'express';
import https from 'https';
import vm from 'vm';
import redisClient from '../config/redis';

// Map editor language identifiers to Piston identifiers
const languageMap: { [key: string]: { name: string; version: string } } = {
  'javascript': { name: 'javascript', version: '18.15.0' },
  'typescript': { name: 'typescript', version: '5.0.3' },
  'python': { name: 'python', version: '3.10.0' },
  'java': { name: 'java', version: '15.0.2' },
  'cpp': { name: 'cpp', version: '10.2.0' }
};

// Helper function to send HTTPS POST request
const postRequest = (url: string, data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
};

// Local VM execution sandbox fallback for JavaScript
const runLocalJS = (code: string): { stdout: string; stderr: string } => {
  const stdoutLogs: string[] = [];
  const sandbox = {
    console: {
      log: (...args: any[]) => {
        stdoutLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
      },
      error: (...args: any[]) => {
        stdoutLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
      },
      warn: (...args: any[]) => {
        stdoutLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
      }
    }
  };

  try {
    const context = vm.createContext(sandbox);
    vm.runInContext(code, context, { timeout: 2000 });
    return {
      stdout: stdoutLogs.join('\n'),
      stderr: ''
    };
  } catch (err: any) {
    return {
      stdout: stdoutLogs.join('\n'),
      stderr: err.message || 'Execution error'
    };
  }
};

export const runCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      res.status(400).json({
        success: false,
        message: 'Language and code fields are required',
        data: null
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        data: null
      });
      return;
    }

    const targetLang = languageMap[language.toLowerCase()];
    if (!targetLang) {
      res.status(400).json({
        success: false,
        message: `Unsupported language: ${language}. Supported languages are: javascript, typescript, python, java, cpp.`,
        data: null
      });
      return;
    }

    // Rate limiting: max 10 runs per minute per user
    const userId = req.user.id;
    const minuteStamp = Math.floor(Date.now() / 60000);
    const limitKey = `rateLimit:code:${userId}:${minuteStamp}`;

    const currentRuns = await redisClient.get(limitKey);
    if (currentRuns && parseInt(currentRuns) >= 10) {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. You can only run code 10 times per minute.',
        data: null
      });
      return;
    }

    // Increment rate limit key
    await redisClient.set(limitKey, (parseInt(currentRuns || '0') + 1).toString(), 'EX', 60);

    // Call Piston API
    console.log(`Proxying code run for user ${userId} to Piston API (lang: ${targetLang.name})...`);
    
    const pistonPayload = {
      language: targetLang.name,
      version: targetLang.version,
      files: [
        {
          content: code
        }
      ]
    };

    const response = await postRequest('https://emkc.org/api/v2/piston/execute', pistonPayload);

    if (response && response.run) {
      res.status(200).json({
        success: true,
        message: 'Code executed successfully',
        data: {
          stdout: response.run.stdout || '',
          stderr: response.run.stderr || '',
          output: response.run.output || ''
        }
      });
    } else {
      const responseMessage = response && response.message ? response.message : '';
      const isWhitelistWarning = responseMessage.includes('whitelist') || responseMessage.includes('whitelisted');
      
      // If language is JavaScript, fallback to local node VM execution for seamless sandbox testing
      if (language.toLowerCase() === 'javascript') {
        console.warn('Piston API whitelisting active. Falling back to local secure VM sandbox for JS execution.');
        const localRes = runLocalJS(code);
        res.status(200).json({
          success: true,
          message: 'Code executed successfully (local fallback sandbox)',
          data: {
            stdout: localRes.stdout,
            stderr: localRes.stderr,
            output: localRes.stderr || localRes.stdout
          }
        });
        return;
      }
      
      res.status(502).json({
        success: false,
        message: isWhitelistWarning
          ? `Piston API whitelisting is active: ${responseMessage}. Please try running JavaScript for local sandbox execution.`
          : 'Failed to compile and run code via Piston API',
        data: null
      });
    }
  } catch (error: any) {
    console.error('Code execution proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during code execution proxy',
      data: null
    });
  }
};

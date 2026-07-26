export interface CodeRunResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}

export const runCode = async (
  language: string,
  code: string,
  token: string
): Promise<CodeRunResult> => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/code/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ language, code })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        stdout: '',
        stderr: result.message || 'Execution failed',
        error: result.message || 'HTTP error'
      };
    }

    return {
      success: true,
      stdout: result.data.stdout || '',
      stderr: result.data.stderr || ''
    };
  } catch (err: any) {
    return {
      success: false,
      stdout: '',
      stderr: err.message || 'Failed to connect to compilation server',
      error: err.message
    };
  }
};

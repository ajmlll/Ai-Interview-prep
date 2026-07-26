import { apiRequest } from './client';

export interface CodeRunResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}

export const runCode = async (
  language: string,
  code: string,
  _token?: string  // kept for signature compatibility — client.ts reads from localStorage
): Promise<CodeRunResult> => {
  try {
    const result = await apiRequest<{ stdout: string; stderr: string; output: string }>(
      '/code/run',
      {
        method: 'POST',
        body: JSON.stringify({ language, code })
      }
    );

    return {
      success: true,
      stdout: result.data?.stdout || '',
      stderr: result.data?.stderr || ''
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

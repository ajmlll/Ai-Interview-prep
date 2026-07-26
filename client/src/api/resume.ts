import type { ResumeDoc } from '@ai-interview/shared';
import { apiRequest, apiUpload } from './client';

export const uploadResume = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<ResumeDoc> => {
  // Report progress in 3 stages: start (30%), uploading (60%), processing (100%)
  onProgress(30);

  const formData = new FormData();
  formData.append('file', file);

  onProgress(60);

  const result = await apiUpload<ResumeDoc>('/resume/upload', formData);
  onProgress(100);

  if (!result.data) {
    throw new Error(result.message || 'Failed to upload resume');
  }

  return result.data;
};

export const getMyResume = async (): Promise<ResumeDoc | null> => {
  const result = await apiRequest<ResumeDoc>('/resume/me');
  return result.data;
};

import type { ResumeDoc } from '@ai-interview/shared';
import { apiRequest, apiUpload } from './client';

export interface JDAnalysisResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  summary: string;
  tailoredRecommendations: string[];
}

export interface ResumeAuditResult {
  overallScore: number;
  atsScore: number;
  brevityScore: number;
  impactScore: number;
  grammarScore: number;
  strengths: string[];
  improvements: string[];
  suggestedRewrites: Array<{ original: string; improved: string }>;
}

export interface CoverLetterResult {
  coverLetter: string;
  coldEmail: string;
  subjectLine: string;
}

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

export const analyzeJobDescription = async (jobDescription: string): Promise<JDAnalysisResult> => {
  const result = await apiRequest<JDAnalysisResult>('/resume/analyze-jd', {
    method: 'POST',
    body: JSON.stringify({ jobDescription })
  });

  if (!result.data) {
    throw new Error(result.message || 'Failed to analyze Job Description');
  }

  return result.data;
};

export const getResumeAudit = async (): Promise<ResumeAuditResult> => {
  const result = await apiRequest<ResumeAuditResult>('/resume/score', {
    method: 'POST'
  });

  if (!result.data) {
    throw new Error(result.message || 'Failed to audit resume');
  }

  return result.data;
};

export const generateCoverLetter = async (jobDescription: string, tone: string = 'Professional'): Promise<CoverLetterResult> => {
  const result = await apiRequest<CoverLetterResult>('/resume/cover-letter', {
    method: 'POST',
    body: JSON.stringify({ jobDescription, tone })
  });

  if (!result.data) {
    throw new Error(result.message || 'Failed to generate cover letter');
  }

  return result.data;
};

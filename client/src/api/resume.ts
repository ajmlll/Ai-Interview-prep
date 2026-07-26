import type { ResumeDoc } from '@ai-interview/shared';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const uploadResume = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<ResumeDoc> => {
  // Simulate progress callback increments
  for (let i = 1; i <= 10; i++) {
    await delay(150);
    onProgress(i * 10);
  }
  
  return {
    id: `res_${Math.random().toString(36).substring(2, 9)}`,
    userId: 'current_user_id',
    fileName: file.name,
    fileUrl: `https://storage.mockplatform.com/resumes/${file.name}`,
    parsedText: `Resume: ${file.name}\n\nCandidate Profile Details:\n--------------------------\nName: John Doe\nEmail: john.doe@example.com\nRole Focus: Full Stack Engineer\nExperience: 4 years\n\nSkills Parsed:\n- Languages: JavaScript, TypeScript, Python, SQL\n- Frameworks: React, Node.js, Express, Next.js\n- Infrastructure: AWS (S3, EC2), Docker, Git`,
    skills: ['TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    experienceYears: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

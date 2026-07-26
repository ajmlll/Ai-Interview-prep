import mongoose, { Schema, Document } from 'mongoose';
import type { ResumeDoc as SharedResumeDoc } from '@ai-interview/shared';

export interface IResumeDocument extends Omit<SharedResumeDoc, 'id'>, Document {}

const ResumeSchema = new Schema<IResumeDocument>({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  parsedText: { type: String },
  skills: { type: [String], default: [] },
  experienceYears: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      const r = ret as any;
      r.id = r._id.toString();
      delete r._id;
      delete r.__v;
      return r;
    }
  }
});

export const ResumeModel = mongoose.model<IResumeDocument>('Resume', ResumeSchema);

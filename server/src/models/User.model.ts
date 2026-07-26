import mongoose, { Schema, Document } from 'mongoose';
import type { User as SharedUser } from '@ai-interview/shared';

export interface IUserDocument extends Omit<SharedUser, 'id'>, Document {
  passwordHash: string;
}

const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true }
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      const r = ret as any;
      delete r._id;
      delete r.__v;
      delete r.passwordHash;
      return r;
    }
  }
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

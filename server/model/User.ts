import mongoose from 'mongoose';
import type { User } from '@dishdetail/shared';

// Omit id fields that mongoose handles internally
type UserDocument = Omit<User, 'id'> & { _id: mongoose.Types.ObjectId };

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['user', 'owner'], default: 'user' },
    ownedEstablishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment',
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model<UserDocument>('User', UserSchema);

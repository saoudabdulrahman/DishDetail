import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    bio: { type: String, default: '', maxlength: 500 },
    role: { type: String, enum: ['user', 'owner'], default: 'user' },
    ownedEstablishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment',
      default: null,
    },
  },
  { timestamps: true },
);

UserSchema.index({ username: 'text' });

export default mongoose.model('User', UserSchema);

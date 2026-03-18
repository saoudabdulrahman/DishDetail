import mongoose from 'mongoose';
import type { Review, Comment, OwnerResponse } from '@dishdetail/shared';

type ReviewDocument = Omit<Review, '_id' | 'establishment'> & {
  _id: mongoose.Types.ObjectId;
  establishment: mongoose.Types.ObjectId;
};

const CommentSchema = new mongoose.Schema<Comment>(
  {
    author: { type: String, required: true },
    date: { type: String, required: true },
    body: { type: String, required: true },
    isEdited: { type: Boolean, default: false },
  },
  { _id: true },
);

const OwnerResponseSchema = new mongoose.Schema<OwnerResponse>(
  {
    date: { type: String, required: true },
    body: { type: String, required: true },
  },
  { _id: false },
);

const ReviewSchema = new mongoose.Schema<ReviewDocument>(
  {
    // The legacyId field is used to map reviews imported from our previous system.
    // It's indexed to allow for efficient lookups during periodic data syncs.
    legacyId: { type: Number, index: true },
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewer: { type: String, required: true },
    reviewerAvatar: { type: String, default: '' },
    date: { type: String, default: () => new Date().toISOString() },
    body: { type: String, required: true },
    reviewImage: { type: String, default: null },
    helpfulCount: { type: Number, default: 0 },
    unhelpfulCount: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    comments: { type: [CommentSchema], default: [] },
    ownerResponse: { type: OwnerResponseSchema, default: null as any },
  },
  { timestamps: true },
);

export default mongoose.model<ReviewDocument>('Review', ReviewSchema);

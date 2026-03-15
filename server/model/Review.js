import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
	{
		author: { type: String, required: true },
		date: { type: String, required: true },
		body: { type: String, required: true },
		isEdited: { type: Boolean, default: false },
	},
	{ _id: true },
);

const OwnerResponseSchema = new mongoose.Schema(
	{
		date: { type: String, required: true },
		body: { type: String, required: true },
	},
	{ _id: false },
);

const ReviewSchema = new mongoose.Schema(
	{
		// The legacyId field is used to map reviews imported from our previous system.
		// It's indexed to allow for efficient lookups during periodic data syncs.
		legacyId: { type: Number, index: true },
		establishment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Establishment',
			required: true,
		},
		rating: { type: Number, required: true, min: 1, max: 5 },
		reviewer: { type: String, required: true },
		reviewerAvatar: { type: String, default: '' },
		date: { type: Date, default: Date.now },
		body: { type: String, required: true },
		reviewImage: { type: String, default: null },
		helpfulCount: { type: Number, default: 0 },
		unhelpfulCount: { type: Number, default: 0 },
		isEdited: { type: Boolean, default: false },
		comments: { type: [CommentSchema], default: [] },
		ownerResponse: { type: OwnerResponseSchema, default: null },
	},
	{ timestamps: true },
);

export default mongoose.model('Review', ReviewSchema);

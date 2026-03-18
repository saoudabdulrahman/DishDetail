import mongoose from 'mongoose';
import type { Establishment } from '@dishdetail/shared';

type EstablishmentDocument = Omit<Establishment, '_id'> & { _id: mongoose.Types.ObjectId };

const EstablishmentSchema = new mongoose.Schema<EstablishmentDocument>(
  {
    // legacyId is kept for mapping establishments back to our legacy dataset.
    // It's indexed to support efficient syncing operations.
    legacyId: { type: Number, index: true },
    restaurantName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    cuisine: { type: String, required: true, trim: true },
    rating: { type: Number, default: 0 },
    restaurantImage: { type: String, default: '' },
    description: { type: String, default: '' },
    address: { type: String, default: '' },
    hours: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model<EstablishmentDocument>('Establishment', EstablishmentSchema);

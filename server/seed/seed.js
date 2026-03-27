import dotenv from 'dotenv';
import slugify from 'slugify';
import { connectDb } from '../model/db.js';
import Establishment from '../model/Establishment.js';
import Review from '../model/Review.js';
import User from '../model/User.js';
import { restaurantsData, reviewsData } from '../../client/src/data.js';

dotenv.config();

// Normalizes legacy data with safe defaults for missing or null values
function ensureString(v, fallback = '') {
  return typeof v === 'string' ? v : fallback;
}

async function main() {
  await connectDb(process.env.MONGODB_URI);

  // Clear existing collections
  await Promise.all([
    Establishment.deleteMany({}),
    Review.deleteMany({}),
    User.deleteMany({}),
  ]);

  // Seed establishments
  const establishments = await Establishment.insertMany(
    restaurantsData.map((r) => ({
      legacyId: r.id,
      restaurantName: r.restaurantName,
      slug: slugify(r.restaurantName, { lower: true, strict: true }),
      cuisine: r.cuisine,
      rating: r.rating,
      restaurantImage: r.restaurantImage,
      description: r.description,
      address: r.address,
      hours: r.hours,
      phone: r.phone,
      website: r.website,
    })),
  );

  // Map legacy IDs to new MongoDB ObjectIds for review/establishment linking
  const idMap = new Map(establishments.map((e) => [e.legacyId, e._id]));

  // Seed users from reviewers
  // Extract unique reviewer names; filter(Boolean) removes empty/null values
  const uniqueReviewers = Array.from(
    new Set(reviewsData.map((r) => r.reviewer).filter(Boolean)),
  );

  await User.insertMany(
    uniqueReviewers.map((username) => ({
      username,
      email: `${username.toLowerCase().replace(/\s+/g, '')}@example.com`,
      password: 'password123', // Demo data only; use hashed passwords in production
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
      bio: '',
      role: 'user',
    })),
  );

  // Add a sample owner account linked to the first establishment
  const firstEst = establishments[0];
  await User.create({
    username: 'owner',
    email: 'owner@example.com',
    password: 'owner12345', // Demo credentials for testing
    avatar: `https://i.pravatar.cc/150?u=owner`,
    bio: 'I manage this establishment.',
    role: 'owner',
    ownedEstablishment: firstEst?._id || null,
  });

  // Seed reviews
  // Transform legacy review data to new schema; map restaurantId via idMap
  await Review.insertMany(
    reviewsData.map((r) => ({
      legacyId: r.id,
      establishment: idMap.get(r.restaurantId),
      title: ensureString(r.title, 'Untitled Review'),
      rating: r.rating,
      reviewer: ensureString(r.reviewer),
      reviewerAvatar: ensureString(r.reviewerAvatar),
      date: ensureString(r.date),
      body: ensureString(r.body),
      reviewImage: r.reviewImage || null,
      helpfulCount: r.helpfulCount || 0,
      unhelpfulCount: r.unhelpfulCount || 0,
      isEdited: r.isEdited || false,
      comments:
        r.comments?.map((c) => ({
          author: ensureString(c.author),
          date: ensureString(c.date),
          body: ensureString(c.body),
          isEdited: c.isEdited || false,
        })) || [],
      ownerResponse:
        r.ownerResponse ?
          {
            date: ensureString(r.ownerResponse.date),
            body: ensureString(r.ownerResponse.body),
          }
        : null,
    })),
  );

  console.log('Seed complete.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

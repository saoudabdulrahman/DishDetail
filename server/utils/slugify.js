import slugify from 'slugify';
import Establishment from '../model/Establishment.js';

/**
 * Converts a restaurant name into a URL-safe slug using the slugify library,
 * then guarantees uniqueness against the Establishment collection by appending
 * a numeric suffix if needed.
 *
 * Examples:
 *   "The Rusty Spoon"  -> "the-rusty-spoon"
 *   "The Rusty Spoon"  -> "the-rusty-spoon-2"  (if the first already exists)
 */
export async function generateSlug(name) {
  const base = slugify(name, { lower: true, strict: true, trim: true });

  let slug = base;
  let count = 1;
  while (await Establishment.exists({ slug })) {
    slug = `${base}-${count++}`;
  }
  return slug;
}

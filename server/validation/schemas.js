import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalTrimmedUrl = z
  .string()
  .trim()
  .max(2048, 'URL is too long.')
  .optional()
  .or(z.literal(''))
  .transform((value) => {
    if (!value) return undefined;
    return value;
  })
  .refine(
    (value) => value === undefined || z.string().url().safeParse(value).success,
    'Please enter a valid URL.',
  );

export const paramsSchema = {
  id: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid id format.'),
  }),
  slug: z.object({
    slug: z.string().regex(slugRegex, 'Invalid slug format.'),
  }),
};

export const querySchema = {
  establishmentsList: z.object({
    q: z.string().trim().max(100, 'Search query is too long.').optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cuisine: z
      .string()
      .trim()
      .max(50, 'Cuisine filter is too long.')
      .optional(),
  }),
  reviewsList: z.object({
    q: z.string().trim().max(100, 'Search query is too long.').optional(),
    establishmentId: z
      .string()
      .regex(objectIdRegex, 'Invalid establishment id format.')
      .optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cuisine: z
      .string()
      .trim()
      .max(50, 'Cuisine filter is too long.')
      .optional(),
  }),
};

export const bodySchema = {
  signup: z.object({
    email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters.')
      .max(32, 'Username must be at most 32 characters.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
  }),
  login: z.object({
    username: z.string().trim().min(1, 'Username is required.'),
    password: z.string().min(1, 'Password is required.'),
  }),
  userUpdate: z.object({
    avatar: optionalTrimmedUrl,
    bio: z
      .string()
      .trim()
      .max(500, 'Bio must be at most 500 characters.')
      .optional(),
  }),
  reviewCreate: z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Review title is required.')
      .max(200, 'Review title must be at most 200 characters.'),
    rating: z.coerce.number().int().min(1).max(5),
    reviewer: z
      .string()
      .trim()
      .min(1, 'Reviewer is required.')
      .max(64, 'Reviewer name is too long.'),
    reviewerAvatar: optionalTrimmedUrl,
    body: z
      .string()
      .trim()
      .min(1, 'Review body is required.')
      .max(5000, 'Review body must be at most 5000 characters.'),
    reviewImage: optionalTrimmedUrl.nullable().optional(),
  }),
  reviewVote: z.object({
    type: z
      .string()
      .trim()
      .refine((value) => value === 'helpful' || value === 'unhelpful', {
        message: 'Invalid vote type.',
      }),
  }),
  reviewUpdate: z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Review title cannot be empty.')
      .max(200, 'Review title must be at most 200 characters.')
      .optional(),
    body: z
      .string()
      .trim()
      .min(1, 'Review body cannot be empty.')
      .max(5000, 'Review body must be at most 5000 characters.')
      .optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    isEdited: z.boolean().optional(),
    helpfulCount: z.number().int().min(0).optional(),
    unhelpfulCount: z.number().int().min(0).optional(),
    comments: z
      .array(
        z.object({
          _id: z.string().optional(),
          author: z
            .string()
            .trim()
            .min(1, 'Comment author is required.')
            .max(64, 'Comment author is too long.'),
          date: z.iso.datetime('Comment date must be a valid ISO datetime.'),
          body: z
            .string()
            .trim()
            .min(1, 'Comment body cannot be empty.')
            .max(2000, 'Comment body must be at most 2000 characters.'),
          isEdited: z.boolean().optional(),
        }),
      )
      .optional(),
    ownerResponse: z
      .object({
        date: z.iso.datetime('Response date must be a valid ISO datetime.'),
        body: z
          .string()
          .trim()
          .min(1, 'Response body cannot be empty.')
          .max(2000, 'Response body must be at most 2000 characters.'),
      })
      .nullable()
      .optional(),
    reviewImage: optionalTrimmedUrl.nullable().optional(),
  }),
};

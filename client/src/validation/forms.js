import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .max(2048, 'URL is too long.')
  .optional()
  .or(z.literal(''))
  .transform((value) => value || '')
  .refine(
    (value) => !value || z.string().url().safeParse(value).success,
    'Please enter a valid URL.',
  );

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Please enter your username.'),
  password: z.string().min(1, 'Please enter your password.'),
});

export const signupSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters.')
      .max(32, 'Username must be at most 32 characters.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirm: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((value) => value.password === value.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match.',
  });

export const submitReviewSchema = z.object({
  selectedRestaurantSlug: z
    .string()
    .trim()
    .min(1, 'Please select a restaurant to review.'),
  rating: z.number().int().min(1, 'Please select a star rating.').max(5),
  reviewTitle: z
    .string()
    .trim()
    .min(1, 'Please enter a review title.')
    .max(200, 'Review title must be at most 200 characters.'),
  reviewText: z
    .string()
    .trim()
    .min(1, 'Please write a review.')
    .max(5000, 'Review must be at most 5000 characters.'),
});

export const profileSchema = z.object({
  avatarUrl: optionalUrl,
  bio: z.string().trim().max(500, 'Bio must be at most 500 characters.'),
});

export const reviewEditSchema = z.object({
  editTitle: z
    .string()
    .trim()
    .min(1, 'Review title cannot be empty.')
    .max(200, 'Review title must be at most 200 characters.'),
  editBody: z
    .string()
    .trim()
    .min(1, 'Review body cannot be empty.')
    .max(5000, 'Review body must be at most 5000 characters.'),
  editRating: z.number().int().min(1, 'Please select a star rating.').max(5),
});

export const commentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty.')
    .max(2000, 'Comment must be at most 2000 characters.'),
});

export const ownerResponseSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Response cannot be empty.')
    .max(2000, 'Response must be at most 2000 characters.'),
});

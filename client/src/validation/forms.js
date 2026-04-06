import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .max(2048, 'URL is too long.')
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
  title: z
    .string()
    .trim()
    .min(1, 'Review title cannot be empty.')
    .max(200, 'Review title must be at most 200 characters.'),
  body: z
    .string()
    .trim()
    .min(1, 'Review body cannot be empty.')
    .max(5000, 'Review body must be at most 5000 characters.'),
  rating: z.number().int().min(1, 'Please select a star rating.').max(5),
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

export const createEstablishmentSchema = z.object({
  restaurantName: z
    .string()
    .trim()
    .min(1, 'Restaurant name is required.')
    .max(200, 'Restaurant name must be at most 200 characters.'),
  cuisine: z.string().trim().min(1, 'At least one cuisine is required.'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be at most 1000 characters.')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .trim()
    .max(300, 'Address must be at most 300 characters.')
    .optional()
    .or(z.literal('')),
  hours: z
    .string()
    .trim()
    .max(200, 'Hours must be at most 200 characters.')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone must be at most 30 characters.')
    .optional()
    .or(z.literal('')),
  website: optionalUrl.optional().or(z.literal('')),
});

export const updateEstablishmentSchema = z.object({
  restaurantName: z
    .string()
    .trim()
    .min(1, 'Restaurant name cannot be empty.')
    .max(200, 'Restaurant name must be at most 200 characters.')
    .optional(),
  cuisine: z
    .string()
    .trim()
    .min(1, 'At least one cuisine is required.')
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be at most 1000 characters.')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .trim()
    .max(300, 'Address must be at most 300 characters.')
    .optional()
    .or(z.literal('')),
  hours: z
    .string()
    .trim()
    .max(200, 'Hours must be at most 200 characters.')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone must be at most 30 characters.')
    .optional()
    .or(z.literal('')),
  website: optionalUrl.optional().or(z.literal('')),
});

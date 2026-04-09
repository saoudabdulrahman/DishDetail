import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '../utils/auth.js';

const router = express.Router();

// Multer config for in-memory storage (we stream directly to cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Configure Cloudinary using environment variables
// Ensure CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are set.
cloudinary.config({
  // Configuration is usually picked up automatically from CLOUDINARY_URL
  // But we can also set it explicitly if needed.
});

router.post('/', verifyToken, upload.single('image'), (req, res, _next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  // Stream the buffer to Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'dishdetail_reviews',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    },
    (error, result) => {
      if (error) {
        req.log?.error({ err: error }, 'Cloudinary upload failed');
        return res.status(500).json({
          error: 'Failed to upload image.',
        });
      }
      res.status(200).json({ url: result.secure_url });
    },
  );

  uploadStream.end(req.file.buffer);
});

export default router;

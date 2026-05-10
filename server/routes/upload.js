import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '../utils/auth.js';

const router = express.Router();
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Multer config for in-memory storage (we stream directly to cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, and WebP images are allowed.');
      error.status = 400;
      return cb(error);
    }
    return cb(null, true);
  },
});

// Configure Cloudinary using environment variables
// Ensure CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are set.
cloudinary.config();

function handleMulterUpload(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image must be 5MB or smaller.' });
      }
      return res.status(400).json({ error: 'Invalid upload request.' });
    }

    if (error) {
      return res
        .status(error.status || 400)
        .json({ error: error.message || 'Invalid upload request.' });
    }

    return next();
  });
}

router.post('/', verifyToken, handleMulterUpload, (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: 'No image file provided.' });

  // Stream the buffer to Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'dishdetail_reviews',
      allowed_formats: ['jpg', 'png', 'webp'],
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
    (error, result) => {
      if (error) {
        req.log?.error({ err: error }, 'Cloudinary upload failed');
        return res.status(500).json({
          error: 'Failed to upload image.',
        });
      }
      res.status(200).json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    },
  );

  uploadStream.end(req.file.buffer);
});

export default router;

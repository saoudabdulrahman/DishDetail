const cloudinaryEnvKeys = [
  'CLOUDINARY_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

export function validateServerConfig(env = process.env) {
  const missing = [];

  for (const key of ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_ORIGIN']) {
    if (!env[key]) missing.push(key);
  }

  const hasCloudinaryUrl = Boolean(env.CLOUDINARY_URL);
  const hasCloudinaryParts = Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
  );

  if (!hasCloudinaryUrl && !hasCloudinaryParts) {
    missing.push(
      'CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET',
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required server configuration: ${missing.join(', ')}`,
    );
  }

  return {
    clientOrigin: env.CLIENT_ORIGIN,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '2h',
    mongoUri: env.MONGODB_URI,
    cloudinaryConfigured: cloudinaryEnvKeys.some((key) => Boolean(env[key])),
  };
}

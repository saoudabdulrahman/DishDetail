import { describe, expect, it } from 'vitest';
import { validateServerConfig } from '../utils/config.js';

describe('validateServerConfig', () => {
  it('throws a clear error for missing required configuration', () => {
    expect(() => validateServerConfig({})).toThrow(
      /Missing required server configuration: MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN/,
    );
  });

  it('accepts complete Cloudinary URL configuration', () => {
    expect(
      validateServerConfig({
        MONGODB_URI: 'mongodb://127.0.0.1:27017/dishdetail',
        JWT_SECRET: 'secret',
        CLIENT_ORIGIN: 'http://localhost:5173',
        CLOUDINARY_URL: 'cloudinary://key:secret@cloud',
      }),
    ).toMatchObject({
      clientOrigin: 'http://localhost:5173',
      jwtExpiresIn: '2h',
      mongoUri: 'mongodb://127.0.0.1:27017/dishdetail',
      cloudinaryConfigured: true,
    });
  });
});

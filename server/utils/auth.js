import jwt from 'jsonwebtoken';
import { pino } from 'pino';

const logger = pino();

function readUserFromToken(req) {
  const jwtSecret = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header.' };
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return { error: 'Missing token.' };
  }

  if (!jwtSecret) {
    return { error: 'JWT secret is not configured.', status: 500 };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return {
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      },
    };
  } catch (error) {
    logger.warn({ err: error }, 'JWT verification failed');
    return { error: 'Invalid or expired token.' };
  }
}

export function verifyToken(req, res, next) {
  const result = readUserFromToken(req);
  if (result.user) {
    req.user = result.user;
    return next();
  }
  return res.status(result.status || 401).json({ error: result.error });
}

export function optionalToken(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader) return next();

  const result = readUserFromToken(req);
  if (result.user) {
    req.user = result.user;
  }
  return next();
}

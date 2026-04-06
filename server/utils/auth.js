import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid authorization header.' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'Missing token.' });
  }

  if (!jwtSecret) {
    return res.status(500).json({ error: 'JWT secret is not configured.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    return next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

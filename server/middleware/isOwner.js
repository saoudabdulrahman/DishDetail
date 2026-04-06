/**
 * Middleware that restricts a route to authenticated users with the 'owner' role.
 * Must be used after verifyToken, which populates req.user from the JWT.
 */
export function isOwner(req, res, next) {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ error: 'Owner access required.' });
  }
  return next();
}

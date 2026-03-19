/**
 * Converts a Mongoose User document into a safe, public-facing object
 * by stripping sensitive fields like the password hash.
 */
export function publicUser(u) {
  return {
    id: u._id.toString(),
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    bio: u.bio,
    role: u.role,
    ownedEstablishment: u.ownedEstablishment || null,
  };
}

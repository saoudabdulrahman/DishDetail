/**
 * Converts a Mongoose User document into a safe, public-facing object
 * by stripping sensitive fields like the password hash.
 * Only includes the email address if `includePrivate` is true.
 */
export function publicUser(u, includePrivate = false) {
  const user = {
    id: u._id.toString(),
    username: u.username,
    bio: u.bio,
    role: u.role,
    ownedEstablishment: u.ownedEstablishment || null,
  };

  if (includePrivate) {
    user.email = u.email;
  }

  return user;
}

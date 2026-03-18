import { api } from '../api';
import type { PublicUser } from '@dishdetail/shared';

export async function saveUser(
  user: Record<string, unknown>,
): Promise<PublicUser> {
  const client = api();
  const { user: created } = await client.signup(user);
  return created;
}

export async function validateUser(
  username: string,
  password: string,
): Promise<PublicUser> {
  const client = api();
  const { user } = await client.login({ username, password });
  return user;
}

export async function updateUser(
  userId: string,
  updates: Partial<PublicUser>,
): Promise<PublicUser> {
  const client = api();
  const { user } = await client.updateUser(userId, updates);
  return user;
}

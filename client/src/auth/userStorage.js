import { api } from '../api';

export async function saveUser(user) {
  const client = api();
  const { user: created, token } = await client.signup(user);
  return { user: created, token };
}

//export async function validateUser(username, password) {
//  const client = api();
//  const { user } = await client.login({ username, password });
//  return user;
//}

export async function updateUser(userId, updates) {
  const client = api();
  const { user } = await client.updateUser(userId, updates);
  return user;
}

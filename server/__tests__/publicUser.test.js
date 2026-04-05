import { describe, it, expect } from 'vitest';
import { publicUser } from '../utils/publicUser.js';

describe('publicUser utility', () => {
  it('should remove the password from the user object and format _id to id', () => {
    const mockUser = {
      _id: { toString: () => '12345' },
      username: 'testuser',
      email: 'test@example.com',
      password: 'supersecretpassword123',
      bio: 'hello',
      role: 'user',
      ownedEstablishment: null,
    };

    const result = publicUser(mockUser);

    expect(result.password).toBeUndefined(); // Crucial: explicitly verifying it doesn't leak
    expect(result.username).toBe('testuser');
    expect(result.id).toBe('12345');
    expect(result._id).toBeUndefined();
  });
});

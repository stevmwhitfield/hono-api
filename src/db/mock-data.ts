import { User } from './types';

const users: User[] = [
  {
    id: '1',
    aud: 'example-service',
    role: 'user',
    email: 'user@example.com',
    encryptedPassword: '123456',
    lastSignInAt: new Date('2025-05-14').toISOString(),
    createdAt: new Date('2025-05-13').toISOString(),
    updatedAt: new Date('2025-05-13').toISOString(),
  },
];

export { users };

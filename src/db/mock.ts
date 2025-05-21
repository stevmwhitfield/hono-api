import { users } from './mock-data';
import { User } from './types';

async function findUserByEmailAndAudience(email: string, aud: string): Promise<User | null> {
  return new Promise(resolve => {
    const user = users.find(user => user.email === email && user.aud === aud);
    if (!user) {
      resolve(null);
      return;
    }
    resolve(user);
  });
}

export { findUserByEmailAndAudience };

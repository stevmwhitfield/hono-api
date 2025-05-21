import { Context } from 'hono';
import { findUserByEmailAndAudience } from '../db/mock';
import { getRequestAudience } from './helpers';
import { TokenRequest } from './types';

async function passwordGrant(c: Context) {
  const audience = await getRequestAudience(c);

  const body: TokenRequest = await c.req.json();
  if (body.email === '') {
    return c.json({ message: 'email is required' }, 400);
  }

  const user = await findUserByEmailAndAudience(body.email, audience);
  if (!user) {
    return c.json({ message: 'user not found' }, 404);
  }

  return c.json({ token: '' });
}

export { passwordGrant };

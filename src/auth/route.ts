import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { validateTokenRequest } from './middleware';
import { passwordGrant } from './grants';

const app = new Hono();

app.post('/token', validator('json', validateTokenRequest), async c => {
  const grantType = c.req.query('grant_type');

  let handler = await passwordGrant(c);

  switch (grantType) {
    case 'password':
      break; // default
    case 'refresh_token':
      // handler = a.RefreshTokenGrant;
      break;
    default:
      return c.json({ message: 'unsupported grant_type' }, 400);
  }

  return handler;
});

export default app;

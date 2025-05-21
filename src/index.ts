import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { JwtVariables } from 'hono/jwt';
import { jwtAuth } from './auth/middleware';
import authRoute from './auth/route';

type Variables = JwtVariables & { jwtToken: string };

const app = new Hono<{ Variables: Variables }>();

app.use(logger());

app.use(
  '*',
  cors({
    credentials: true,
    origin: origin => origin || '*',
  })
);

app.use('/api/v1/*', jwtAuth);

app.get('/health', c => {
  return c.json({ message: 'ok', timestamp: new Date().toISOString() });
});

app.route('/', authRoute);

export default {
  fetch: app.fetch,
  port: 8000,
};

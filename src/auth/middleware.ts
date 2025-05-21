import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';
import { tokenSchema } from './schema';
import { Context } from 'hono';
import { TokenRequest } from './types';

const jwtAuth = createMiddleware(async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  });
  return jwtMiddleware(c, next);
});

const validateTokenRequest = (value: TokenRequest, c: Context) => {
  const parsed = tokenSchema.safeParse(value);
  if (!parsed.success) {
    return c.json(parsed.error, 400);
  }
  return parsed.data;
};

export { jwtAuth, validateTokenRequest };

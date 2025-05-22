import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { JwtVariables } from 'hono/jwt';
import { jwtAuth } from './auth/middleware';
import authRoute from './auth/route';
import { HTTPException } from 'hono/http-exception';

type Variables = JwtVariables & { jwtToken: string };

const app = new Hono<{ Variables: Variables }>();

// -- middleware --

app.use(logger());

app.use(
    '*',
    cors({
        credentials: true,
        origin: (origin) => origin || '*',
    }),
);

app.use('/api/v1/*', jwtAuth);

// -- routes --

app.route('/auth', authRoute);

app.get('/api/v1/hello', (c) => {
    return c.json({ message: 'hello' });
});

app.get('/health', (c) => {
    return c.json({ message: 'ok', timestamp: new Date().toISOString() });
});

// -- error handling --

app.onError((err, c) => {
    console.error(err);

    if (err instanceof HTTPException) {
        return c.json({ message: err.message }, err.status);
    }

    return c.json({ message: 'internal server error' }, 500);
});

// -- serve --

export default {
    fetch: app.fetch,
    port: 8000,
};

import { Context, Hono } from 'hono';
import { PinoLogger, pinoLogger } from 'hono-pino';
import { rateLimiter } from 'hono-rate-limiter';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from './auth/routes';
import { db } from './db/db';
import { demo } from './demo/routes';
import { env } from './env';

type Variables = { logger: PinoLogger };

const app = new Hono<{ Variables: Variables }>();

const rateLimiterConfig = {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    keyGenerator: (c: Context) => c.req.header('x-forwarded-for') ?? '',
};

// -- middleware --

app.use(pinoLogger({ pino: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' } }));

if (env.NODE_ENV === 'production') {
    app.use(csrf());
}

app.use(secureHeaders());
app.use(
    '*',
    cors({
        credentials: true,
        origin: env.NODE_ENV === 'production' ? 'https://example.com' : '*', // use real domain for prod
    }),
);

// limit auth requests to 10 per minute
app.use(
    '/auth',
    rateLimiter({
        ...rateLimiterConfig,
        limit: env.RATE_LIMIT_AUTH,
    }),
);

// limit all other requests to 100 per minute
app.use(
    rateLimiter({
        ...rateLimiterConfig,
        limit: env.RATE_LIMIT_API,
    }),
);

// -- routes --

app.get('/health', (c) => {
    return c.json({
        message: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    });
});

// public auth routes
app.route('/auth', auth);

// protected api routes
app.route('/api', demo);

// -- error handling --

app.onError((err, c) => {
    if (err instanceof HTTPException) {
        return c.json({ error: err.message, status: err.status }, err.status);
    }

    console.error('unhandled error:', err);
    return c.json({ message: 'internal server error', status: 500 }, 500);
});

app.notFound((c) => {
    return c.json({ message: 'not found', status: 404 }, 404);
});

// -- graceful shutdown --

async function handleShutdown() {
    console.log('Shutting down...');
    try {
        await Promise.all([db.cleanupExpiredRefreshTokens(), db.cleanupRevokedRefreshTokens()]);
        console.log('Cleanup successful.');
    } catch (err) {
        console.error('shutdown failed:', err);
    } finally {
        db.close();
        console.log('Shutdown complete.');
        setTimeout(() => process.exit(0), 100);
    }
}

process.once('SIGINT', handleShutdown);
process.once('SIGTERM', handleShutdown);

// -- serve --

const port = env.PORT;
console.log(`Server running on http://localhost:${port} in ${env.NODE_ENV.toUpperCase()} mode`);

export default { port, fetch: app.fetch };

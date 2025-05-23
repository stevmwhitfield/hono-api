import { sql } from 'drizzle-orm';
import { Context, Hono } from 'hono';
import { PinoLogger } from 'hono-pino';
import { rateLimiter } from 'hono-rate-limiter';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from './auth/routes';
import { env } from './core/env';
import { customLogger } from './core/logger';
import { db } from './db';
import { demo } from './demo/routes';
import { refreshTokenRepo } from './db/refresh-token.repo';

type Variables = { logger: PinoLogger };

const app = new Hono<{ Variables: Variables }>();

const rateLimiterConfig = {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    keyGenerator: (c: Context) => c.req.header('x-forwarded-for') ?? '',
};

// -- middleware --

app.use(customLogger());

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

app.get('/health', async (c) => {
    try {
        await db.execute(sql`SELECT 1`);
        return c.json({
            message: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
            environment: env.NODE_ENV,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        });
    } catch (err) {
        console.error('health check failed:', err);
        return c.json(
            {
                message: 'error',
                database: 'connection failed',
                error: err instanceof Error ? err.message : err,
                timestamp: new Date().toISOString(),
                environment: env.NODE_ENV,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
            },
            503,
        );
    }
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
    console.log('\nShutting down...');
    try {
        await refreshTokenRepo.cleanupExpiredRefreshTokens();
        await refreshTokenRepo.cleanupRevokedRefreshTokens();
        console.log('Successfully cleaned up.');
    } catch (err) {
        console.error('error in shutdown:', err);
    } finally {
        console.log('Shutdown complete.\n');
        setTimeout(() => process.exit(0), 100);
    }
}

process.once('SIGINT', handleShutdown);
process.once('SIGTERM', handleShutdown);

// -- serve --

const port = env.PORT;
console.log(`Server running on http://localhost:${port} in ${env.NODE_ENV.toUpperCase()} mode`);

export default { port, fetch: app.fetch };

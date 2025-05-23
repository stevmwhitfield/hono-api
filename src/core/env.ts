import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const env = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'production']),
        LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
        PORT: z.coerce.number().min(1000).max(65535),
        JWT_SECRET: z.string().base64(),
        JWT_EXP: z.coerce.number().min(1).max(3600),
        JWT_AUD: z.string().min(1),
        RATE_LIMIT_WINDOW_MS: z.coerce.number().min(1),
        RATE_LIMIT_AUTH: z.coerce.number().min(1),
        RATE_LIMIT_API: z.coerce.number().min(1),
        DATABASE_URL: z.string().min(1),
    },
    runtimeEnv: process.env,
    onValidationError: (issues) => {
        console.error('env validation failed:');
        issues.forEach((issue) => {
            console.error(issue.path?.join('.'), issue.message);
        });
        process.exit(1);
    },
    onInvalidAccess: (variable) => {
        console.error(`invalid access to env variable: ${variable}`);
        process.exit(1);
    },
});

export { env };

import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const env = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'production']),
        PORT: z.coerce.number().min(1000).max(65535),
        JWT_SECRET: z.string().base64(),
        JWT_EXP: z.coerce.number().min(1),
        JWT_AUD: z.string().min(1),
        DATABASE_URL: z.string().min(1),
    },
    runtimeEnv: process.env,
});

export { env };

import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const env = createEnv({
  server: {
    PORT: z.coerce.number().min(1000).max(65535),
    JWT_SECRET: z.string().min(1),
    JWT_AUD: z.string().min(1),
  },
  runtimeEnv: process.env,
});

export { env };

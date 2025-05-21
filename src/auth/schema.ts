import { z } from 'zod';

const tokenSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export { tokenSchema };

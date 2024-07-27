import zod from 'zod';

export const env = zod
  .object({
    PORT: zod.coerce.number().default(3000),
    DATABASE_URL: zod.string(),
    JWT_SECRET: zod.string().min(32),
    COOKIE_SECRET: zod.string().min(8),
  })
  .parse(process.env);

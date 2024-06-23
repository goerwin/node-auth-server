import zod from 'zod';

export const config = zod
  .object({
    PORT: zod.coerce.number().optional(),
    DATABASE_URL: zod.string(),
    JWT_SECRET: zod.string().min(32),
  })
  .parse(process.env);

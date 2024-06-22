import zod from 'zod';

export const config = zod
  .object({
    PORT: zod.coerce.number().optional(),
    DATABASE_URL: zod.string(),
  })
  .parse(process.env);

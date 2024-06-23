import zod from 'zod';

export const NewUser = zod.object({
  name: zod.string().trim().min(3),
  email: zod.string().email().trim(),
  password: zod
    .string()
    .trim()
    .min(8)
    .refine((val) => /\d+/.test(val), {
      message: 'Password must contain a number',
    })
    .refine((val) => /[a-z]+/.test(val), {
      message: 'Password must contain a lowercase letter',
    })
    .refine((val) => /[A-Z]+/.test(val), {
      message: 'Password must contain an uppercase letter',
    })
    .refine((val) => /[^a-zA-Z0-9]+/.test(val), {
      message: 'Password must contain a special character',
    }),
});

export type NewUser = zod.infer<typeof NewUser>;

export const LoginInput = zod.object({
  email: NewUser.shape.email,
  password: NewUser.shape.password,
});

export type LoginInput = zod.infer<typeof LoginInput>;

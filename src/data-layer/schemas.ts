import zod from 'zod';

export const SignupUser = zod.object({
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

export type SignupUser = zod.infer<typeof SignupUser>;

export const LoginUser = zod.object({
  email: SignupUser.shape.email,
  password: SignupUser.shape.password,
});

export type LoginUser = zod.infer<typeof LoginUser>;

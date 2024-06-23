import zod from 'zod';

// tries fn and returns [null, result] if successful, [error, null] if not
export async function tryAsync<T>(fn: () => Promise<T>): Promise<[null, T] | [Error]> {
  try {
    return [null, await fn()];
  } catch (error) {
    if (error instanceof Error) return [error];
    return [new Error('Unknown error')];
  }
}

// tries fn and returns [null, result] if successful, [error, null] if not
export function trySync<T>(fn: () => T): [null, T] | [Error] {
  try {
    return [null, fn()];
  } catch (error) {
    if (error instanceof Error) return [error];
    return [new Error('Unknown error')];
  }
}

export const UserResponse = zod.object({
  id: zod.number(),
  name: zod.string().trim().min(3),
  email: zod.string().email().trim(),
});

export type UserResponse = zod.infer<typeof UserResponse>;

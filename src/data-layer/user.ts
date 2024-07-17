import argon2 from 'argon2';
import type postgres from 'postgres';
import zod from 'zod';
import { EmailUniqueError, InvalidCredentialsError } from '../errors.js';
import { UserResponse, tryAsync } from '../utils.js';
import { LoginUser, SignupUser } from './schemas.js';

export async function createUser<T = SignupUser>(
  newUser: T,
  dbInstance: postgres.Sql,
): Promise<[Error] | [null, UserResponse]> {
  const { error, data: parsedNewUser } = await SignupUser.safeParseAsync(newUser);

  if (error) return [error];

  const [hashError, hashedPassword] = await tryAsync(() => argon2.hash(parsedNewUser.password));

  if (hashError) return [hashError];

  const [sqlError, resp] = await tryAsync(
    () =>
      dbInstance`INSERT INTO users ${dbInstance({
        ...parsedNewUser,
        password: hashedPassword,
      })} RETURNING *`,
  );

  if (sqlError?.message.includes('email_unique')) return [new EmailUniqueError()];
  if (sqlError) return [sqlError];

  const { error: userParseError, data } = UserResponse.safeParse(resp[0]);

  if (userParseError) return [userParseError];
  return [null, data];
}

export async function loginUser<T = LoginUser>(
  input: T,
  dbInstance: postgres.Sql,
): Promise<[Error] | [null, UserResponse]> {
  const { error: parseError, data: parsedInput } = LoginUser.safeParse(input);

  if (parseError) return [parseError];

  const [error, resp] = await tryAsync(
    () => dbInstance`SELECT * FROM users WHERE email = ${parsedInput.email}`,
  );

  if (error) return [error];
  if (!resp[0]) return [new InvalidCredentialsError()];

  const { error: zodError, data: user } = UserResponse.extend({
    password: zod.string(),
  }).safeParse(resp[0]);

  if (zodError) return [zodError];

  const isPasswordValid = await argon2.verify(user.password, parsedInput.password);

  if (!isPasswordValid) return [new InvalidCredentialsError()];

  return [null, UserResponse.parse(user)];
}

import argon2 from 'argon2';
import postgres from 'postgres';
import { config } from '../config.js';
import {
  EmailUniqueError,
  InvalidCredentialsError,
  UnknownError,
  isError,
} from '../errors.js';
import { LoginInput, NewUser, UserResponse } from './schemas.js';

const sql = postgres(config.DATABASE_URL);

export async function createUser<T = NewUser>(newUser: T) {
  try {
    const parsedNewUser = await NewUser.parseAsync(newUser);
    const hashedPassword = await argon2.hash(parsedNewUser.password);

    const resp = await sql`INSERT INTO users ${sql({
      ...parsedNewUser,
      password: hashedPassword,
    })} RETURNING *`;

    return UserResponse.parse(resp[0]);
  } catch (error) {
    if (!isError(error)) throw new UnknownError();
    if (error.message.includes('email_unique')) throw new EmailUniqueError();
    throw error;
  }
}

export async function loginUser<T = LoginInput>(input: T) {
  try {
    const parsedInput = LoginInput.parse(input);

    const resp =
      await sql`SELECT * FROM users WHERE email = ${parsedInput.email}`;

    if (!resp[0]) throw new InvalidCredentialsError();

    const user = UserResponse.extend({
      password: NewUser.shape.password,
    }).parse(resp[0]);

    if (await argon2.verify(user.password, parsedInput.password))
      return UserResponse.parse(user);

    throw new InvalidCredentialsError();
  } catch (error) {
    if (!isError(error)) throw new UnknownError();
    throw error;
  }
}

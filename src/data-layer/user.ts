import postgres from 'postgres';
import { LoginInput, NewUser, UserResponse } from './schemas.js';
import bcrypt from 'bcrypt';
import {
  EmailUniqueError,
  InvalidCredentialsError,
  UnknownError,
  isError,
} from '../errors.js';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

const sql = postgres(process.env.DATABASE_URL);
const BCRYPT_PASSWORD_SALT_ROUNDS = 12;

export async function createUser(newUser: unknown) {
  try {
    const parsedNewUser = await NewUser.parseAsync(newUser);

    const resp = await sql`INSERT INTO users ${sql({
      ...parsedNewUser,
      password: await bcrypt.hash(
        parsedNewUser.password,
        BCRYPT_PASSWORD_SALT_ROUNDS
      ),
    })} RETURNING *`;

    return UserResponse.parse(resp[0]);
  } catch (error) {
    if (!isError(error)) throw new UnknownError();
    if (error.message.includes('email_unique')) throw new EmailUniqueError();
    throw error;
  }
}

export async function loginUser(input: unknown) {
  try {
    const parsedInput = LoginInput.parse(input);

    const resp =
      await sql`SELECT * FROM users WHERE email = ${parsedInput.email}`;

    if (!resp[0]) throw new InvalidCredentialsError();

    const user = UserResponse.extend({
      password: NewUser.shape.password,
    }).parse(resp[0]);

    if (await bcrypt.compare(parsedInput.password, user.password))
      return UserResponse.parse(user);

    throw new InvalidCredentialsError();
  } catch (error) {
    if (!isError(error)) throw new UnknownError();
    throw error;
  }
}

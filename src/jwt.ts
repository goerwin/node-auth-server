import { TextEncoder } from 'node:util';
import { SignJWT, jwtVerify } from 'jose';
import { env } from './env.js';
import { tryAsync } from './utils.js';

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

const HASHING_ALGORITHM = 'HS256';

export async function signJWT(payload: Record<string, string | number>) {
  return tryAsync(() =>
    new SignJWT(payload)
      .setProtectedHeader({ alg: HASHING_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secretKey),
  );
}

export async function verifyJWT(jwt: string) {
  return tryAsync(() => jwtVerify(jwt, secretKey));
}

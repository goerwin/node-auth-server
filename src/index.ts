import fastifyCookie from '@fastify/cookie';
import fastify from 'fastify';
import { ZodError } from 'zod';
import { env } from './env.js';
import { getDBInstance } from './data-layer/db.js';
import { createUser, loginUser } from './data-layer/user.js';
import {
  EmailUniqueError,
  InvalidCredentialsError,
  InvalidTokenError,
  NoTokenError,
  UnknownError,
} from './errors.js';
import { signJWT, verifyJWT } from './jwt.js';
import { UserResponse } from './utils.js';

function sendUserAndTokenCookie(res: fastify.FastifyReply, user: UserResponse, token: string) {
  res.setCookie('token', token, { httpOnly: true }).send(user);
}

function clearTokenCookie(res: fastify.FastifyReply) {
  res.clearCookie('token');
}

export async function createApp({
  port,
  cookieSecret,
  databaseUrl,
}: { port: number; cookieSecret: string; databaseUrl: string }) {
  const app = fastify({ logger: true });
  const dbInstance = getDBInstance(databaseUrl);

  app.register(fastifyCookie, { secret: cookieSecret });

  app.get('/', (_, res) => {
    res.send({ hello: 'world' });
  });

  app.post('/signup', async (req, res) => {
    const [error, user] = await createUser(req.body, dbInstance);

    if (error instanceof EmailUniqueError) return res.status(500).send(new EmailUniqueError());
    if (error instanceof ZodError) return res.status(500).send(error.errors);
    if (error) return res.status(500).send(new UnknownError(error));

    const [tokenError, token] = await signJWT(user);

    if (tokenError) return res.status(500).send(new UnknownError(tokenError));

    res.setCookie('token', token, { httpOnly: true }).send(user);
  });

  app.post('/signin', async (req, res) => {
    const [error, user] = await loginUser(req.body, dbInstance);

    if (error instanceof ZodError) return res.status(500).send(error.errors);

    if (error instanceof InvalidCredentialsError) {
      clearTokenCookie(res);
      return res.status(401).send(new InvalidCredentialsError());
    }

    if (error) return res.status(500).send(new UnknownError());

    const [signError, token] = await signJWT(user);

    if (signError) return res.status(500).send(new UnknownError());

    sendUserAndTokenCookie(res, user, token);
  });

  app.post('/verify', async (req, res) => {
    const { token } = req.cookies;

    if (!token) return res.status(401).send(new NoTokenError());

    const [error, data] = await verifyJWT(token);

    if (error) {
      clearTokenCookie(res);
      return res.status(401).send(new InvalidTokenError());
    }

    const { error: payloadError, data: user } = UserResponse.safeParse(data.payload);

    if (payloadError) {
      clearTokenCookie(res);
      return res.status(401).send(new InvalidTokenError());
    }

    sendUserAndTokenCookie(res, user, token);
  });

  try {
    await app.listen({ port });
    console.log('Listening in port:', port);
  } catch (error) {
    app.log.error(error);
    throw error;
  }

  return app;
}

createApp({
  port: env.PORT,
  cookieSecret: env.COOKIE_SECRET,
  databaseUrl: env.DATABASE_URL,
});

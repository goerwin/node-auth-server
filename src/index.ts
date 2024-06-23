import fastifyCookie from '@fastify/cookie';
import fastify from 'fastify';
import { ZodError } from 'zod';
import { config } from './config.js';
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

const PORT = config.PORT || 3000;
const app = fastify({ logger: true });

// biome-ignore lint/suspicious/noExplicitAny: kind of hard to infer the res type
function sendUserAndCookie(res: any, user: UserResponse, token: string) {
  res.setCookie('token', token, { httpOnly: true }).send(user);
}

app.register(fastifyCookie, { secret: config.COOKIE_SECRET });

app.get('/', (_, res) => {
  res.send({ hello: 'world' });
});

app.post('/register', async (req, res) => {
  const [error, user] = await createUser(req.body);

  if (error instanceof EmailUniqueError) return res.status(500).send(new EmailUniqueError());
  if (error instanceof ZodError) return res.status(500).send(error.errors);
  if (error) return res.status(500).send(new UnknownError());

  const [tokenError, token] = await signJWT(user);

  if (tokenError) return res.status(500).send(new UnknownError());

  res.setCookie('token', token, { httpOnly: true }).send(user);
});

app.post('/login', async (req, res) => {
  const [error, user] = await loginUser(req.body);

  if (error instanceof InvalidCredentialsError)
    return res.status(500).send(new InvalidCredentialsError());

  if (error instanceof ZodError) return res.status(500).send(error.errors);
  if (error) return res.status(500).send(new UnknownError());

  const [signError, token] = await signJWT(user);

  if (signError) return res.status(500).send(new UnknownError());

  sendUserAndCookie(res, user, token);
});

app.post('/verify', async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).send(new NoTokenError());

  const [error, data] = await verifyJWT(token);

  if (error) return res.status(401).send(new InvalidTokenError());

  const { error: payloadError, data: user } = UserResponse.safeParse(data.payload);

  if (payloadError) return res.status(401).send(new InvalidTokenError());

  sendUserAndCookie(res, user, token);
});

try {
  await app.listen({ port: PORT });
  console.log('Listening in port:', PORT);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

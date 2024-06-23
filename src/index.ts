import fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { config } from './config.js';
import { createUser, loginUser } from './data-layer/user.js';
import {
  EmailUniqueError,
  InvalidCredentialsError,
  UnknownError,
} from './errors.js';

const PORT = config.PORT || 3000;
const app = fastify({ logger: true });

app.get('/', (_, res) => {
  res.send({ hello: 'world' });
});

app.post('/register', async (req, res) => {
  try {
    const user = await createUser(req.body);
    const token = jwt.sign(user, config.JWT_SECRET, { expiresIn: '7d' });

    res.send({ ...user, token });
  } catch (error) {
    if (error instanceof EmailUniqueError)
      return res.status(500).send(new EmailUniqueError());

    if (error instanceof ZodError) return res.status(500).send(error.errors);

    console.error(error);
    res.status(500).send(new UnknownError());
  }
});

app.post('/login', async (req, res) => {
  try {
    const user = await loginUser(req.body);
    const token = jwt.sign(user, config.JWT_SECRET, { expiresIn: '7d' });

    res.send({ ...user, token });
  } catch (error) {
    console.error(error);

    if (error instanceof EmailUniqueError)
      return res.status(500).send(new EmailUniqueError());

    if (error instanceof InvalidCredentialsError)
      return res.status(401).send(new InvalidCredentialsError());

    if (error instanceof ZodError) return res.status(500).send(error.errors);

    res.status(500).send(new UnknownError());
  }
});

try {
  await app.listen({ port: PORT });
  console.log('Listening in port:', PORT);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

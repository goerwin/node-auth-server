import fastify from 'fastify';
import { createUser, loginUser } from './data-layer/user.js';
import {
  EmailUniqueError,
  InvalidCredentialsError,
  UnknownError,
} from './errors.js';
import { ZodError } from 'zod';

const PORT = Number(process.env.PORT) || 3000;
const app = fastify({ logger: true });

app.get('/', (_, res) => {
  res.send({ hello: 'world' });
});

app.post('/register', async (req, res) => {
  try {
    const newUser = await createUser(req.body);

    res.send(newUser);
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
    const resp = await loginUser(req.body);
    res.send(resp);
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

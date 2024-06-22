export class UnknownError extends Error {
  constructor() {
    super('UnknownError');
  }
}

export class EmailUniqueError extends Error {
  constructor() {
    super('EmailUniqueError');
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('InvalidCredentialsError');
  }
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

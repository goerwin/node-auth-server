export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnknownError extends BaseError {
  constructor(error?: unknown) {
    console.log(error);
    super('UnknownError');
  }
}

export class EmailUniqueError extends BaseError {
  constructor(error?: unknown) {
    console.log(error);
    super('EmailUniqueError');
  }
}

export class InvalidCredentialsError extends BaseError {
  constructor(error?: unknown) {
    console.log(error);
    super('InvalidCredentialsError');
  }
}

export class InvalidTokenError extends BaseError {
  constructor(error?: unknown) {
    console.log(error);
    super('InvalidTokenError');
  }
}

export class NoTokenError extends BaseError {
  constructor(error?: unknown) {
    console.log(error);
    super('NoTokenError');
  }
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

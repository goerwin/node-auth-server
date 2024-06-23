export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Note: for debugging purposes
    // console.log(this);
  }
}

export class UnknownError extends BaseError {
  constructor() {
    super('UnknownError');
  }
}

export class EmailUniqueError extends BaseError {
  constructor() {
    super('EmailUniqueError');
  }
}

export class InvalidCredentialsError extends BaseError {
  constructor() {
    super('InvalidCredentialsError');
  }
}

export class InvalidTokenError extends BaseError {
  constructor() {
    super('InvalidTokenError');
  }
}

export class NoTokenError extends BaseError {
  constructor() {
    super('NoTokenError');
  }
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

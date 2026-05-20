import { AppError, type AppErrorDetails } from './app-error';

export class DomainError extends AppError {
  constructor(
    code: string,
    options?: { message?: string; details?: AppErrorDetails; cause?: unknown }
  ) {
    super({
      code,
      category: 'bad_request',
      status: 400,
      message: options?.message,
      details: options?.details,
      cause: options?.cause,
    });
    this.name = 'DomainError';
  }
}

import { AppError, type AppErrorDetails } from './app-error';

export class ConfigurationError extends AppError {
  constructor(
    message: string,
    options?: { details?: AppErrorDetails; cause?: unknown }
  ) {
    super({
      code: 'CONFIGURATION_ERROR',
      category: 'system',
      status: 500,
      message,
      details: options?.details,
      cause: options?.cause,
    });
    this.name = 'ConfigurationError';
  }
}

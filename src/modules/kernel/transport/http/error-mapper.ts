import { AppError } from '@/modules/kernel/domain/errors/app-error';

export function appErrorToResponse(error: unknown): Response {
  if (error instanceof AppError) {
    const payload: {
      code: string;
      category: AppError['category'];
      message: string;
      details?: AppError['details'];
    } = {
      code: error.code,
      category: error.category,
      message: error.message,
    };
    if (error.exposeDetails) payload.details = error.details;

    return Response.json(payload, { status: error.status });
  }

  return Response.json(
    {
      code: 'INTERNAL_SERVER_ERROR',
      category: 'system',
      message: 'Internal server error',
    },
    { status: 500 }
  );
}

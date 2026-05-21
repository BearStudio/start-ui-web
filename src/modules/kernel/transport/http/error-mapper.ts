import { AppError } from '@/modules/kernel/domain/errors/app-error';

export function appErrorToResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        code: error.code,
        category: error.category,
        message: error.message,
        details: error.details,
      },
      { status: error.status }
    );
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

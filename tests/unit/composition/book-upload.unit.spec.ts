import { beforeEach, describe, expect, it, vi } from 'vitest';

const bookUploadMocks = vi.hoisted(() => {
  const logger = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  };

  return {
    createBookCoverUploadRoute: vi.fn(() => 'book-cover-route'),
    envClient: {
      VITE_IS_DEMO: false,
    },
    getDefaultUploadClient: vi.fn(() => 'upload-client'),
    getStorageConfig: vi.fn(() => ({ bucketName: 'book-covers' })),
    handleRequest: vi.fn(),
    logger,
    telemetry: {
      startSpan: vi.fn((_options: unknown, fn: () => unknown) => fn()),
    },
  };
});

vi.mock('@better-upload/server', () => ({
  handleRequest: bookUploadMocks.handleRequest,
}));

vi.mock('@/composition/auth', () => ({
  getAuthUseCases: vi.fn(() => ({
    getCurrentSession: vi.fn(),
  })),
}));

vi.mock('@/composition/book', () => ({
  getBookUseCases: vi.fn(() => ({})),
}));

vi.mock('@/composition/kernel', () => ({
  getKernel: vi.fn(() => ({
    logger: bookUploadMocks.logger,
  })),
}));

vi.mock('@/modules/book/transport/upload/book-cover', () => ({
  createBookCoverUploadRoute: bookUploadMocks.createBookCoverUploadRoute,
}));

vi.mock('@/modules/kernel/infrastructure/config/storage', () => ({
  getStorageConfig: bookUploadMocks.getStorageConfig,
}));

vi.mock('@/modules/kernel/infrastructure/storage/better-upload', () => ({
  getDefaultUploadClient: bookUploadMocks.getDefaultUploadClient,
}));

vi.mock('@/platform/env/client', () => ({
  envClient: bookUploadMocks.envClient,
}));

vi.mock('@/platform/telemetry', () => ({
  getTelemetry: vi.fn(() => bookUploadMocks.telemetry),
}));

describe('book upload composition', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    bookUploadMocks.envClient.VITE_IS_DEMO = false;
    bookUploadMocks.telemetry.startSpan.mockImplementation(
      (_options: unknown, fn: () => unknown) => fn()
    );
  });

  it('wraps upload requests in a telemetry span', async () => {
    const response = new Response('uploaded', { status: 201 });
    bookUploadMocks.handleRequest.mockResolvedValueOnce(response);
    const { handleBookUploadRequest } =
      await import('@/composition/book-upload');
    const request = new Request('https://app.example/api/upload', {
      method: 'POST',
    });

    await expect(handleBookUploadRequest(request)).resolves.toBe(response);

    expect(bookUploadMocks.telemetry.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'http.request.method': 'POST',
          'operation.name': 'book.uploadRequest',
          'operation.type': 'http_handler',
          'upload.provider': 'better-upload',
        }),
        name: 'book.uploadRequest',
        op: 'upload.http',
      }),
      expect.any(Function)
    );
    expect(bookUploadMocks.handleRequest).toHaveBeenCalledWith(
      request,
      expect.objectContaining({
        bucketName: 'book-covers',
        client: 'upload-client',
        routes: {
          bookCover: 'book-cover-route',
        },
      })
    );
  });

  it('keeps demo upload rejections inside the telemetry span', async () => {
    bookUploadMocks.envClient.VITE_IS_DEMO = true;
    const { handleBookUploadRequest } =
      await import('@/composition/book-upload');
    const request = new Request('https://app.example/api/upload', {
      method: 'PUT',
    });

    const response = await handleBookUploadRequest(request);

    expect(response.status).toBe(405);
    await expect(response.text()).resolves.toBe('Demo Mode');
    expect(bookUploadMocks.handleRequest).not.toHaveBeenCalled();
    expect(bookUploadMocks.telemetry.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'http.request.method': 'PUT',
          'operation.name': 'book.uploadRequest',
        }),
        name: 'book.uploadRequest',
      }),
      expect.any(Function)
    );
  });
});

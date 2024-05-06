import { UseMutateAsyncFunction } from '@tanstack/react-query';

import { UploadSignedUrlInput } from './schemas';

export const fetchFile = (url: string, metadata?: string[]) => async () => {
  const fileResponse = await fetch(url);
  if (!fileResponse.ok) {
    throw new Error('Could not fetch the file');
  }

  const lastModifiedDateHeader = fileResponse.headers.get('Last-Modified');

  return (metadata || []).reduce(
    (file, currentMetadata) => {
      return {
        ...file,
        [currentMetadata]: fileResponse.headers.get(
          `x-amz-meta-${currentMetadata}`
        ),
      };
    },
    {
      fileUrl: url,
      size: fileResponse.headers.get('Content-Length') ?? undefined,
      type: fileResponse.headers.get('Content-Type') ?? undefined,
      lastModifiedDate: lastModifiedDateHeader
        ? new Date(lastModifiedDateHeader)
        : new Date(),
    }
  );
};

export const uploadFile =
  (
    getPresignedUrl: UseMutateAsyncFunction<
      { signedUrl: string; futureFileUrl: string },
      unknown,
      UploadSignedUrlInput | void
    >
  ) =>
  async (
    file?: File,
    {
      metadata,
    }: {
      metadata?: Record<string, string>;
    } = {}
  ) => {
    if (!file) {
      return {
        fileUrl: undefined,
      };
    }

    console.log(file.name + ' uploaded');
    const { signedUrl, futureFileUrl } = await getPresignedUrl({
      metadata: {
        name: file.name,
        ...metadata,
      },
    });

    await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    return {
      fileUrl: futureFileUrl,
    } as const;
  };

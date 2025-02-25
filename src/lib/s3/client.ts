import { stringify } from 'superjson';

import { env } from '@/env.mjs';
import { trpc } from '@/lib/trpc/client';
import { RouterInputs } from '@/lib/trpc/types';

export const uploadFile = async (params: {
  file: File;
  trpcClient: ReturnType<typeof trpc.useUtils>['client'];
  collection: RouterInputs['files']['uploadPresignedUrl']['collection'];
  metadata?: Record<string, string>;
  onError?: (file: File, error: unknown) => void;
}) => {
  try {
    const presignedUrlOutput =
      await params.trpcClient.files.uploadPresignedUrl.mutate({
        // Metadata is a Record<string, string> but should be serialized for trpc-openapi
        metadata: params.metadata ? stringify(params.metadata) : undefined,
        collection: params.collection,
        type: params.file.type,
        size: params.file.size,
        name: params.file.name,
      });

    const response = await fetch(presignedUrlOutput.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': params.file.type },
      body: params.file,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return presignedUrlOutput.key;
  } catch (error) {
    params.onError?.(params.file, error);
    throw error;
  }
};

export const getFilePublicUrl = (key: string | null | undefined) => {
  if (!key) {
    return undefined;
  }
  return `${env.NEXT_PUBLIC_S3_BUCKET_PUBLIC_URL}/${key}`;
};

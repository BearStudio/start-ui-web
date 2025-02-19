import { FilesCollectionConfig } from '@/lib/s3/config';
import { FieldMetadata } from '@/lib/s3/schemas';

type ValidateReturn =
  | { success: true }
  | {
      success: false;
      error: {
        message: string;
        key: 'tooLarge' | 'typeNotAllowed';
      };
    };

export const validateFile = (params: {
  input: FieldMetadata;
  config: FilesCollectionConfig;
}): ValidateReturn => {
  if (
    params.config.maxSize &&
    (params.input.size ?? 0) >= params.config.maxSize
  ) {
    return {
      error: {
        key: 'tooLarge',
        message: `File size is too big ${params.input.size}/${params.config.maxSize}`,
      },
      success: false,
    };
  }

  if (
    params.config.allowedTypes &&
    !params.config.allowedTypes.includes(params.input.type ?? '')
  ) {
    return {
      error: {
        key: 'typeNotAllowed',
        message: `Incorrect file type ${params.input.type} (authorized: ${params.config.allowedTypes.join(',')})`,
      },
      success: false,
    };
  }
  return { success: true };
};

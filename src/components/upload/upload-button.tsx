import {
  type ClientUploadError,
  type FileUploadInfo,
  uploadFile,
  type UploadStatus,
} from '@better-upload/client';
import { useMutation } from '@tanstack/react-query';
import { UploadIcon } from 'lucide-react';
import {
  type ChangeEvent,
  type ComponentProps,
  type ReactElement,
  useId,
  useRef,
} from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

import type { UploadRoutes } from '@/routes/api/upload';

export type UploadButtonProps = {
  uploadRoute: UploadRoutes;
  /**
   * Called only if the file was uploaded successfully.
   */
  onSuccess?: (file: FileUploadInfo<'complete'>) => void;
  onUploadStateChange?: <T extends UploadStatus>(
    file: FileUploadInfo<T>
  ) => void;
  onError?: (error: Error | ClientUploadError) => void;
  inputProps?: ComponentProps<'input'>;
  icon?: ReactElement;
  getMetadata?: (
    file: File
  ) => NonNullable<Parameters<typeof uploadFile>[0]['metadata']>;
} & Omit<ComponentProps<typeof Button>, 'onChange'>;

export const UploadButton = ({
  children,
  inputProps,
  onUploadStateChange,
  onSuccess,
  onError,
  disabled,
  icon,
  uploadRoute,
  getMetadata,
  ...rest
}: UploadButtonProps) => {
  const innerId = useId();

  const uploadMutation = useMutation({
    mutationKey: ['fileUpload', uploadRoute],
    mutationFn: async (file: File) => {
      return uploadFile({
        file,
        route: uploadRoute,
        onFileStateChange: ({ file }) => {
          onUploadStateChange?.(file);
        },
        metadata: getMetadata?.(file),
      });
    },
    onSuccess: ({ file }) => {
      onSuccess?.(file);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        size={!children ? 'icon' : undefined}
        loading={uploadMutation.isPending}
        disabled={uploadMutation.isPending || disabled}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(keyboardEvent) => {
          // Skip if the pressed key is neither enter or space
          if (!['Enter', ' '].includes(keyboardEvent.key)) return;

          // Prevent space key to trigger page scroll (and Enter to bubble)
          keyboardEvent.preventDefault();

          inputRef.current?.click();
        }}
        {...rest}
      >
        {!children ? (icon ?? <UploadIcon />) : children}
      </Button>
      <input
        {...inputProps}
        id={innerId}
        ref={inputRef}
        className={cn('hidden', inputProps?.className)}
        type="file"
        disabled={uploadMutation.isPending || disabled}
        onChange={(onChangeEvent) => {
          handleFileChange(onChangeEvent);
          inputProps?.onChange?.(onChangeEvent);
        }}
      />
    </>
  );
};

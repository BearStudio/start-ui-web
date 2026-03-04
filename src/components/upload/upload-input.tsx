import { getUiState } from '@bearstudio/ui-state';
import {
  type ClientUploadError,
  type FileUploadInfo,
  uploadFile,
  type UploadStatus,
} from '@better-upload/client';
import { useMutation } from '@tanstack/react-query';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  CircleAlertIcon,
  FileIcon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';
import {
  type ChangeEvent,
  type ComponentProps,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import type { UploadRoutes } from '@/routes/api/upload';

const uploadInputVariants = cva(
  cn(
    'flex w-full items-center gap-2 rounded-md border text-left text-xs transition-[color,box-shadow]',
    'cursor-pointer',
    'hover:bg-accent/50',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
    'has-[[aria-invalid=true]]:border-destructive'
  ),
  {
    variants: {
      size: {
        sm: 'h-8',
        default: 'h-9',
        lg: 'h-10 text-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const uploadInputFilledVariants = cva('', {
  variants: {
    size: {
      sm: 'px-1',
      default: 'px-1.5',
      lg: 'px-2',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const uploadInputEmptyVariants = cva('', {
  variants: {
    size: {
      sm: 'px-2.5',
      default: 'px-3',
      lg: 'px-4',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const filePreviewVariants = cva(
  'flex shrink-0 items-center justify-center rounded',
  {
    variants: {
      size: {
        sm: 'size-5',
        default: 'size-6',
        lg: 'size-7',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export type UploadInputDefaultValue = {
  name: string;
  url?: string;
};

export type UploadInputProps = VariantProps<typeof uploadInputVariants> & {
  uploadRoute: UploadRoutes;
  onSuccess?: (file: FileUploadInfo<'complete'>) => void;
  onUploadStateChange?: <T extends UploadStatus>(
    file: FileUploadInfo<T>
  ) => void;
  onError?: (error: Error | ClientUploadError) => void;
  onClear?: () => void;
  inputProps?: ComponentProps<'input'>;
  getMetadata?: (
    file: File
  ) => NonNullable<Parameters<typeof uploadFile>[0]['metadata']>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  defaultValue?: UploadInputDefaultValue;
  'aria-invalid'?: ComponentProps<'input'>['aria-invalid'];
  'aria-describedby'?: string;
};

export const UploadInput = ({
  inputProps,
  onUploadStateChange,
  onSuccess,
  onError,
  onClear,
  disabled,
  uploadRoute,
  getMetadata,
  className,
  placeholder,
  defaultValue,
  size,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: UploadInputProps) => {
  const { t } = useTranslation(['components']);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [clearedDefaultValue, setClearedDefaultValue] =
    useState<UploadInputDefaultValue>();
  const dragCounterRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [thumbnailUrl]);

  const showDefault =
    !!defaultValue && !selectedFile && defaultValue !== clearedDefaultValue;

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

  const isDisabled = uploadMutation.isPending || disabled;

  const ui = getUiState((set) => {
    if (selectedFile) return set('selected', { file: selectedFile });
    if (showDefault) return set('default', { defaultValue: defaultValue! });
    return set('empty');
  });

  const handleFile = (file: File) => {
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl);
    }
    setSelectedFile(file);
    setThumbnailUrl(
      file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    );
    uploadMutation.mutate(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset so re-selecting the same file triggers onChange
    event.target.value = '';
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl);
    }
    setSelectedFile(null);
    setThumbnailUrl(null);
    setClearedDefaultValue(defaultValue);
    uploadMutation.reset();
    onClear?.();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items?.length) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && !isDisabled) {
      handleFile(file);
    }
  };

  return (
    <div
      role="button"
      tabIndex={isDisabled ? undefined : 0}
      aria-describedby={ariaDescribedby}
      className={cn(
        uploadInputVariants({ size }),
        ui.is('empty')
          ? cn(
              'border-dashed border-input bg-neutral-50 dark:bg-input/30',
              uploadInputEmptyVariants({ size })
            )
          : cn(
              'border-input bg-background shadow-xs dark:bg-input/30',
              uploadInputFilledVariants({ size })
            ),
        isDragOver && 'border-solid border-ring bg-accent/50',
        uploadMutation.isError &&
          'border-destructive ring-[3px] ring-destructive/20 dark:ring-destructive/40',
        isDisabled && 'pointer-events-none opacity-50',
        className
      )}
      onClick={() => !isDisabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (['Enter', ' '].includes(e.key)) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {ui
        .match('selected', ({ file }) => (
          <>
            <FilePreview
              size={size}
              status={uploadMutation.status}
              thumbnailUrl={thumbnailUrl}
            />
            <span
              className={cn(
                'min-w-0 flex-1 truncate',
                uploadMutation.isError && 'text-destructive'
              )}
            >
              {file.name}
            </span>
          </>
        ))
        .match('default', ({ defaultValue }) => (
          <>
            <FilePreview size={size} thumbnailUrl={defaultValue.url ?? null} />
            <span className="min-w-0 flex-1 truncate">{defaultValue.name}</span>
          </>
        ))
        .match('empty', () => (
          <>
            <UploadCloudIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {placeholder ?? t('components:uploadInput.placeholder')}
            </span>
          </>
        ))
        .exhaustive()}
      {!ui.is('empty') && !isDisabled && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleClear}
          aria-label={t('components:uploadInput.removeFile')}
        >
          <XIcon />
        </Button>
      )}
      <input
        {...inputProps}
        ref={inputRef}
        className={cn('hidden', inputProps?.className)}
        type="file"
        disabled={isDisabled}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        onChange={(e) => {
          handleFileChange(e);
          inputProps?.onChange?.(e);
        }}
      />
    </div>
  );
};

function FilePreview({
  status = 'idle',
  thumbnailUrl,
  size,
}: {
  status?: 'idle' | 'pending' | 'error' | 'success';
  thumbnailUrl: string | null;
  size?: VariantProps<typeof filePreviewVariants>['size'];
}) {
  const previewClass = filePreviewVariants({ size });

  return match(status)
    .with('pending', () => (
      <div className={cn(previewClass, 'bg-muted')}>
        <Spinner className="size-4 shrink-0" />
      </div>
    ))
    .with('error', () => (
      <div className={cn(previewClass, 'bg-destructive/10')}>
        <CircleAlertIcon className="size-3 text-destructive" />
      </div>
    ))
    .with('idle', 'success', () =>
      thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          className={cn(previewClass, 'object-cover shadow-lg')}
        />
      ) : (
        <div className={cn(previewClass, 'bg-muted')}>
          <FileIcon className="size-3 text-muted-foreground" />
        </div>
      )
    )
    .exhaustive();
}

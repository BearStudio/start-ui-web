import {
  type FileUploadInfo,
  type UploadHookControl,
} from 'better-upload/client';
import { UploadIcon } from 'lucide-react';
import {
  type ChangeEvent,
  type ComponentProps,
  useEffect,
  useId,
  useRef,
} from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

export type UploadButtonProps = {
  control: UploadHookControl<false>;
  /**
   * Called only if the file was uploaded successfully.
   */
  onChange?: (file: FileUploadInfo<'complete'>) => void;
  inputProps?: ComponentProps<'input'>;
} & Omit<ComponentProps<typeof Button>, 'onChange'>;

/**
 * Upload button that should be used with useUploadFile() better-upload hook.
 */
export const UploadButton = ({
  children,
  inputProps,
  control,
  onChange,
  disabled,
  ...rest
}: UploadButtonProps) => {
  const innerId = useId();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      control.upload(file);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!control.isSuccess || !control.uploadedFile) return;
    // if success, it means the file was successfully uploaded
    onChange?.(control.uploadedFile);
  }, [control.isSuccess, control.uploadedFile, onChange]);

  return (
    <>
      <Button
        size={!children ? 'icon' : undefined}
        loading={control.isPending}
        disabled={control.isPending || disabled}
        asChild
        {...rest}
      >
        <label
          tabIndex={0}
          htmlFor={innerId}
          onKeyDown={(keyboardEvent) => {
            // Skip if the pressed key is neither enter or space
            if (!['Enter', ' '].includes(keyboardEvent.key)) return;

            // Prevent space key to trigger page scroll (and Enter to bubble)
            keyboardEvent.preventDefault();

            inputRef.current?.click();
          }}
        >
          {!children ? <UploadIcon /> : children}
        </label>
      </Button>
      <input
        {...inputProps}
        id={innerId}
        ref={inputRef}
        className={cn('hidden', inputProps?.className)}
        type="file"
        disabled={control.isPending || disabled}
        onChange={(onChangeEvent) => {
          handleFileChange(onChangeEvent);
          inputProps?.onChange?.(onChangeEvent);
        }}
      />
    </>
  );
};

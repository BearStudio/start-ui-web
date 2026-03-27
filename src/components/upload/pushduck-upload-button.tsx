import { createUploadClient } from 'pushduck/client';
import { UploadIcon } from 'lucide-react';
import {
  type ChangeEvent,
  type ComponentProps,
  type ReactElement,
  useId,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

import type { PushduckUploadRouter } from '@/server/pushduck';

const uploadClient = createUploadClient<PushduckUploadRouter>({
  endpoint: '/api/pushduck',
});

export type PushduckRoutes = keyof PushduckUploadRouter;

export type PushduckUploadButtonProps = {
  uploadRoute: PushduckRoutes;
  onSuccess?: (result: { url: string; key: string }) => void;
  onError?: (error: Error) => void;
  inputProps?: ComponentProps<'input'>;
  icon?: ReactElement;
} & Omit<ComponentProps<typeof Button>, 'onChange'>;

export const PushduckUploadButton = ({
  children,
  inputProps,
  onSuccess,
  onError,
  disabled,
  icon,
  uploadRoute,
  ...rest
}: PushduckUploadButtonProps) => {
  const innerId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);

  // uploadRoute is a stable prop — calling the typed hook via proxy is safe
  const { uploadFiles } = uploadClient[uploadRoute]({
    onSuccess(results) {
      const result = results[0];
      if (result?.url) {
        onSuccess?.({ url: result.url, key: result.key ?? result.url });
      }
    },
    onError(err: unknown) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    },
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsPending(true);
    try {
      await uploadFiles([file]);
    } finally {
      setIsPending(false);
      event.target.value = '';
    }
  };

  return (
    <>
      <Button
        size={!children ? 'icon' : undefined}
        loading={isPending}
        disabled={isPending || disabled}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(keyboardEvent) => {
          if (!['Enter', ' '].includes(keyboardEvent.key)) return;
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
        disabled={isPending || disabled}
        onChange={(onChangeEvent) => {
          handleFileChange(onChangeEvent);
          inputProps?.onChange?.(onChangeEvent);
        }}
      />
    </>
  );
};

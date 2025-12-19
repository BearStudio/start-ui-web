import { useCopyToClipboard } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';

export const useClipboard = (options: { showDuration?: number } = {}) => {
  const [, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    copy(text);
    setIsCopied(true);
  };

  useEffect(() => {
    if (!isCopied) return;

    const timer = setTimeout(() => {
      setIsCopied(false);
    }, options?.showDuration ?? 2000);

    return () => clearTimeout(timer);
  }, [options?.showDuration, isCopied]);

  return { copyToClipboard: copyToClipboard, isCopied };
};

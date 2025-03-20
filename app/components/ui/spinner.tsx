import { Loader2Icon } from 'lucide-react';

import { cn } from '@/lib/tailwind/utils';

export const Spinner = (props: { full?: boolean; className?: string }) => {
  return (
    <span
      className={cn(
        props.full && 'flex flex-1 items-center justify-center',
        props.className
      )}
    >
      <Loader2Icon className="animate-spin" />
    </span>
  );
};

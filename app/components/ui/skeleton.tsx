import { cn } from '@/lib/tailwind/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'animate-pulse rounded-xs bg-black/10 dark:bg-white/20',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };

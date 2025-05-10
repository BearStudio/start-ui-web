import { cn } from '@/lib/tailwind/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <span
      data-slot="skeleton"
      className={cn(
        'block max-w-full animate-pulse rounded-xs bg-black/10 dark:bg-white/20',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };

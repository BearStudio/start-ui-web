import { cn } from '@/lib/tailwind/utils';

export function FormFieldContainer(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('flex flex-1 flex-col gap-1', props.className)}
    />
  );
}

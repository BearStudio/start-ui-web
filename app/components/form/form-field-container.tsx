import { cn } from '@/lib/tailwind/utils';

export const FormFieldContainer = (props: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5', props.className)}>
      {props.children}
    </div>
  );
};

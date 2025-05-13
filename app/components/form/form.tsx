import { useFormContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

export const Form = (
  props: React.PropsWithChildren<{
    className?: string;
  }>
) => {
  const form = useFormContext();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
      noValidate
      className={cn('flex flex-1 flex-col', props.className)}
    >
      {props.children}
    </form>
  );
};

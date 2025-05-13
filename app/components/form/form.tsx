import { useFormContext } from '@/lib/form/context';

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
      className={props.className}
    >
      {props.children}
    </form>
  );
};

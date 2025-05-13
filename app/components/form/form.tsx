export const Form = (
  props: React.PropsWithChildren<{
    className?: string;
    form: { handleSubmit(): Promise<void> };
  }>
) => {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await props.form.handleSubmit();
      }}
      noValidate
      className={props.className}
    >
      {props.children}
    </form>
  );
};

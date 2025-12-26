export type FormFieldSize = 'sm' | 'default' | 'lg';

export type FieldProps<
  TComponent extends React.JSXElementConstructor<ExplicitAny>,
> = React.ComponentProps<TComponent> & {
  /**
   * Set this to `true` if you want to hide the default errors of the field.
   */
  hideErrors?: boolean;
  containerProps?: React.ComponentProps<'div'>;
};

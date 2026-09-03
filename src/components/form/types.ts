import { FormApi } from '@tanstack/react-form';

export type FormFieldSize = 'sm' | 'default' | 'lg';

export type FieldProps<TProps extends object> = Omit<
  TProps,
  'value' | 'ref' | 'id' | 'aria-invalid' | 'aria-describedby'
>;

export type FormInstance<TFormData = ExplicitAny> = FormApi<
  TFormData,
  ExplicitAny,
  ExplicitAny,
  ExplicitAny,
  ExplicitAny,
  ExplicitAny,
  ExplicitAny,
  ExplicitAny,
  ExplicitAny,
  ExplicitAny,
  ExplicitAny,
  ExplicitAny
>;

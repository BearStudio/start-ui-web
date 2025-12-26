import type { FieldValues, UseFormProps } from 'react-hook-form';
import {
  useForm as useRhfForm,
  useFormContext as useRhfFormContext,
} from 'react-hook-form';

import { FormController } from '@/components/new-form';

export function useAppFormContext<
  TFieldValues extends FieldValues = FieldValues,
  TContext = ExplicitAny,
  TTransformedValues = TFieldValues,
>() {
  const formContext = useRhfFormContext<
    TFieldValues,
    TContext,
    TTransformedValues
  >();

  return {
    ...formContext,
    Controller: FormController<TFieldValues>,
  };
}

export function useAppForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = ExplicitAny,
  TTransformedValues = TFieldValues,
>(props: UseFormProps<TFieldValues, TContext, TTransformedValues>) {
  const form = useRhfForm<TFieldValues, TContext, TTransformedValues>(props);

  return {
    ...form,
    Controller: FormController<TFieldValues>,
  };
}

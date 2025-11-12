import type { FieldValues, UseFormProps } from 'react-hook-form';
import {
  useForm as useRhfForm,
  useFormContext as useRhfFormContext,
} from 'react-hook-form';

import { FormField } from '@/components/new-form';

export function useFormContext<
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
    Field: FormField<TFieldValues>,
  };
}

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = ExplicitAny,
  TTransformedValues = TFieldValues,
>(props: UseFormProps<TFieldValues, TContext, TTransformedValues>) {
  const form = useRhfForm<TFieldValues, TContext, TTransformedValues>(props);

  return {
    ...form,
    Field: FormField<TFieldValues>,
  };
}

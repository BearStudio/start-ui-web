import {
  createFormHook,
  FormAsyncValidateOrFn,
  FormValidateOrFn,
} from '@tanstack/react-form';
import { lazy } from 'react';

import { fieldContext, formContext } from '@/lib/form/context';

import {
  FormField,
  FormFieldError,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';

const FieldText = lazy(() => import('@/components/form/field-text'));
const FieldSelect = lazy(() => import('@/components/form/field-select'));
const FieldDate = lazy(() => import('@/components/form/field-date'));
const FieldNumber = lazy(() => import('@/components/form/field-number'));
const FieldOtp = lazy(() => import('@/components/form/field-otp'));

const { useAppForm, withForm: _withForm } = createFormHook({
  fieldComponents: {
    FormFieldLabel,
    FormField,
    FormFieldHelper,
    FormFieldError,
    FieldText,
    FieldSelect,
    FieldDate,
    FieldNumber,
    FieldOtp,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

// Shortcuts generics type to only essential
const withForm = <Fields, Props extends Record<string, unknown>>(
  params: Parameters<
    typeof _withForm<
      Fields,
      FormValidateOrFn<Fields> | undefined,
      FormValidateOrFn<Fields> | undefined,
      FormAsyncValidateOrFn<Fields> | undefined,
      FormValidateOrFn<Fields> | undefined,
      FormAsyncValidateOrFn<Fields> | undefined,
      FormValidateOrFn<Fields> | undefined,
      FormAsyncValidateOrFn<Fields> | undefined,
      FormAsyncValidateOrFn<Fields> | undefined,
      unknown,
      Props
    >
  >[0]
) =>
  _withForm<
    Fields,
    FormValidateOrFn<Fields> | undefined,
    FormValidateOrFn<Fields> | undefined,
    FormAsyncValidateOrFn<Fields> | undefined,
    FormValidateOrFn<Fields> | undefined,
    FormAsyncValidateOrFn<Fields> | undefined,
    FormValidateOrFn<Fields> | undefined,
    FormAsyncValidateOrFn<Fields> | undefined,
    FormAsyncValidateOrFn<Fields> | undefined,
    unknown,
    Props
  >(params);

export { useAppForm, withForm };

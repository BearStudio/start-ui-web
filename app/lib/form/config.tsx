import { createFormHook } from '@tanstack/react-form';
import { lazy } from 'react';

import { fieldContext, formContext } from '@/lib/form/context';

import {
  Form,
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

export const { useAppForm, withForm } = createFormHook({
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
  formComponents: { Form },
  fieldContext,
  formContext,
});

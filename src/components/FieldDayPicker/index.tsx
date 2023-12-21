import { useCallback } from 'react';

import { FieldProps, useField } from '@formiz/core';
import dayjs, { Dayjs } from 'dayjs';
import { isMatch } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

import { DayPicker, DayPickerProps } from '@/components/DayPicker';
import {
  getAfterDateDisabledDatesConfig,
  getBeforeDateDisabledDatesConfig,
} from '@/components/FieldDayPicker/utils';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export type FieldDayPickerPossibleFormattedValue =
  | string
  | number
  | Dayjs
  | Date;

type Value = Dayjs;

export type DisabledDays = 'future' | 'past';
export type FieldDayPickerProps<
  FormattedValue extends FieldDayPickerPossibleFormattedValue = Value,
> = FieldProps<Value, FormattedValue> &
  FormGroupProps & {
    componentProps?: Omit<DayPickerProps, 'onChange'>;
  } & {
    noFormGroup?: boolean;
    invalidMessage?: string;
    disabledDays?: DisabledDays;
  };

export const FieldDayPicker = <
  FormattedValue extends FieldDayPickerPossibleFormattedValue = Value,
>({
  invalidMessage,
  componentProps,
  ...restFieldProps
}: FieldDayPickerProps<FormattedValue>) => {
  const { t } = useTranslation(['components']);

  const getValidations = useCallback(
    () => [
      {
        handler: (v: FormattedValue) => v !== undefined,
        message:
          invalidMessage ?? t('components:fieldDayPicker.invalidMessage'),
      },

      // le spread de la prop validations ne doit pas être à la fin de la constante validations, sinon elle sera exécuté (écrasé)
      ...(restFieldProps.validations ?? []),
      {
        handler: (value: FormattedValue) =>
          value
            ? !isMatch(
                dayjs(value).toDate(),
                !componentProps?.isDisabled
                  ? []
                  : Array.isArray(componentProps.isDisabled)
                    ? componentProps.isDisabled
                    : [componentProps.isDisabled]
              )
            : true,
        message: invalidMessage,
        deps: [componentProps?.isDisabled],
      },
    ],
    [invalidMessage, t, restFieldProps.validations, componentProps?.isDisabled]
  );

  const field = useField(restFieldProps, {
    formatValue: (value) => (value ? dayjs(value) : null) as FormattedValue,
    validations: getValidations(),
  });

  const { noFormGroup, disabledDays, ...rest } = field.otherProps;

  const formGroupProps = {
    ...(noFormGroup ? {} : rest),
    id: field.id,
    errorMessage: field.errorMessage,
    showError: field.shouldDisplayError,
    isRequired: field.isRequired,
  };

  const getDisabledFutureOrPastDaysMatcher = () => {
    switch (disabledDays) {
      case 'future':
        return getAfterDateDisabledDatesConfig(dayjs());
      case 'past':
        return getBeforeDateDisabledDatesConfig(dayjs());
      default:
        return null;
    }
  };

  const defaultDisabledDays = (
    !componentProps?.isDisabled
      ? [getDisabledFutureOrPastDaysMatcher()]
      : Array.isArray(componentProps.isDisabled)
        ? [...componentProps.isDisabled, getDisabledFutureOrPastDaysMatcher()]
        : [componentProps.isDisabled, getDisabledFutureOrPastDaysMatcher()]
  ).filter(Boolean); // We cut out nullable values because the disabled prop do not accept them

  const content = (
    <DayPicker
      dayPickerProps={{
        ...componentProps,
        disabled: defaultDisabledDays,
      }}
      value={field.value ? dayjs(field.value).toDate() : null}
      onChange={(date) =>
        field.setValue(date instanceof Date ? dayjs(date) : date)
      }
      onClose={(date) => {
        field.setIsTouched(true);
        componentProps?.onClose?.(date);
      }}
      inputProps={{
        id: field.id,
        ...componentProps?.inputProps,
      }}
    />
  );

  if (noFormGroup) {
    return content;
  }

  return <FormGroup {...formGroupProps}>{content}</FormGroup>;
};

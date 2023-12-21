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

type UsualDayPickerProps = 'placeholder';

export type DisabledDays = 'future' | 'past';
export type FieldDayPickerProps<
  FormattedValue extends FieldDayPickerPossibleFormattedValue = Value,
> = FieldProps<Value, FormattedValue> &
  FormGroupProps &
  Pick<DayPickerProps, UsualDayPickerProps> & {
    dayPickerProps?: Partial<Omit<DayPickerProps, UsualDayPickerProps>>;
    noFormGroup?: boolean;
    invalidMessage?: string;
    disabledDays?: DisabledDays;
  };

export const FieldDayPicker = <
  FormattedValue extends FieldDayPickerPossibleFormattedValue = Value,
>({
  invalidMessage,
  dayPickerProps,
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
                !dayPickerProps?.isDisabled
                  ? []
                  : Array.isArray(dayPickerProps.isDisabled)
                    ? dayPickerProps.isDisabled
                    : [dayPickerProps.isDisabled]
              )
            : true,
        message: invalidMessage,
        deps: [dayPickerProps?.isDisabled],
      },
    ],
    [invalidMessage, t, restFieldProps.validations, dayPickerProps?.isDisabled]
  );

  const field = useField(restFieldProps, {
    formatValue: (value) => (value ? dayjs(value) : null) as FormattedValue,
    validations: getValidations(),
  });

  const { noFormGroup, disabledDays, placeholder, ...rest } = field.otherProps;

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
    !dayPickerProps?.isDisabled
      ? [getDisabledFutureOrPastDaysMatcher()]
      : Array.isArray(dayPickerProps.isDisabled)
        ? [...dayPickerProps.isDisabled, getDisabledFutureOrPastDaysMatcher()]
        : [dayPickerProps.isDisabled, getDisabledFutureOrPastDaysMatcher()]
  ).filter(Boolean); // We cut out nullable values because the disabled prop do not accept them

  const content = (
    <DayPicker
      placeholder={placeholder}
      dayPickerProps={{
        ...dayPickerProps,
        disabled: defaultDisabledDays,
      }}
      value={field.value ? dayjs(field.value).toDate() : null}
      onChange={(date) => {
        field.setValue(date instanceof Date ? dayjs(date) : date);
        dayPickerProps?.onChange?.(date);
      }}
      onClose={(date) => {
        field.setIsTouched(true);
        dayPickerProps?.onClose?.(date);
      }}
      inputProps={{
        id: field.id,
        ...dayPickerProps?.inputProps,
      }}
    />
  );

  if (noFormGroup) {
    return content;
  }

  return <FormGroup {...formGroupProps}>{content}</FormGroup>;
};

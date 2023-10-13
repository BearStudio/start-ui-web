import { FC, useCallback } from 'react';

import { FieldProps, FieldValidation, useField } from '@formiz/core';
import dayjs, { Dayjs } from 'dayjs';
import { isMatch } from 'react-day-picker';

import { DayPicker, DayPickerProps } from '@/components/DayPicker';
import {
  getAfterDateDisabledDatesConfig,
  getBeforeDateDisabledDatesConfig,
} from '@/components/FieldDayPicker/utils';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type PickedDayPickerProps =
  | 'autoFocus'
  | 'dateFormat'
  | 'dayPickerProps'
  | 'hasTodayButton'
  | 'inputProps'
  | 'popperPlacement'
  | 'placeholder'
  | 'usePortal'
  | 'isDisabled'
  | 'onClose';

export type DisabledDays = 'future' | 'past';
export type FieldDayPickerProps<FormattedValue = Dayjs> = FieldProps<
  Dayjs,
  FormattedValue
> &
  Omit<FormGroupProps, 'onChange'> &
  Pick<DayPickerProps, PickedDayPickerProps> & {
    noFormGroup?: boolean;
    invalidMessage?: string;
    onMonthChange?(date: Date): void;
    disabledDays?: DisabledDays;
  };

export const FieldDayPicker: FC<FieldDayPickerProps> = ({
  invalidMessage = 'Date invalide',
  dayPickerProps,
  required,
  ...restFieldProps
}) => {
  const getValidations = useCallback<
    () => FieldValidation<dayjs.Dayjs, dayjs.Dayjs | undefined>[] | undefined
  >(
    () => [
      {
        handler: (v: Dayjs) => v !== undefined,
        message: invalidMessage,
      },

      // le spread de la prop validations ne doit pas être à la fin de la constante validations, sinon elle sera exécuté (écrasé)
      ...(restFieldProps.validations ?? []),
      {
        handler: (value: Dayjs) =>
          value
            ? !isMatch(
                dayjs(value).toDate(),
                !dayPickerProps?.disabled
                  ? []
                  : Array.isArray(dayPickerProps.disabled)
                  ? dayPickerProps.disabled
                  : [dayPickerProps.disabled]
              )
            : true,
        message: invalidMessage,
        deps: [dayPickerProps?.disabled],
      },
    ],
    [dayPickerProps?.disabled, restFieldProps.validations, invalidMessage]
  );

  const {
    id,
    shouldDisplayError,
    setIsTouched,
    setValue,
    value,
    errorMessage,
    otherProps,
  } = useField(restFieldProps, {
    formatValue: (value: Dayjs | null) => (!!value ? dayjs(value) : undefined),
    validations: getValidations(),
  });

  const {
    label,
    helper,
    placeholder,
    isDisabled,
    inputProps = { size: 'sm' },
    noFormGroup,
    autoFocus,
    popperPlacement,
    dateFormat,
    hasTodayButton,
    usePortal,
    disabledDays,
    onClose,
    onMonthChange,
    ...rest
  } = otherProps;

  const formGroupProps = {
    id,
    label,
    helper,
    errorMessage,
    showError: shouldDisplayError,
    isRequired: !!required,
    ...(noFormGroup ? {} : rest),
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
    !dayPickerProps?.disabled
      ? [getDisabledFutureOrPastDaysMatcher()]
      : Array.isArray(dayPickerProps.disabled)
      ? [...dayPickerProps.disabled, getDisabledFutureOrPastDaysMatcher()]
      : [dayPickerProps.disabled, getDisabledFutureOrPastDaysMatcher()]
  ).filter(Boolean); // We cut out nullable values because the disabled prop do not accept them

  const content = (
    <DayPicker
      placeholder={placeholder}
      value={!!value ? dayjs(value).toDate() : undefined}
      onChange={(date) => setValue(dayjs(date))}
      onClose={(date) => {
        setIsTouched(true);
        onClose?.(date);
      }}
      dayPickerProps={{
        ...dayPickerProps,
        ...(!defaultDisabledDays?.length
          ? {}
          : { disabled: defaultDisabledDays }),
      }}
      inputProps={{
        id,
        'data-test': restFieldProps.name,
        ...inputProps,
      }}
      isDisabled={isDisabled}
      usePortal={usePortal}
      autoFocus={autoFocus}
      required={!!required}
      hasTodayButton={hasTodayButton}
      popperPlacement={popperPlacement}
      dateFormat={dateFormat}
      onMonthChange={onMonthChange}
    />
  );

  if (noFormGroup) {
    return content;
  }

  return (
    <FormGroup width="fit-content" {...formGroupProps}>
      {content}
    </FormGroup>
  );
};

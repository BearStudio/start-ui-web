import React, { ComponentProps, useRef, useState } from 'react';

import {
  Button,
  ButtonGroup,
  Divider,
  Input,
  InputGroup,
  InputGroupProps,
  InputProps,
  forwardRef,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { NumericFormat, numericFormatter } from 'react-number-format';
import { ceil, clamp } from 'remeda';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';
import { getNumberFormatInfo } from '@/lib/numbers';

type CustomProps = {
  value?: number | null;
  defaultValue?: number | null;
  placeholder?: string | number;
  locale?: string;
  currency?: string | null;
  prefix?: string;
  suffix?: string;
  precision?: number;
  fixedPrecision?: boolean;
  step?: number;
  bigStep?: number;
  min?: number;
  max?: number;
  clampValueOnBlur?: boolean;
  showButtons?: boolean;
  onChange?(value: number | null): void;
  inputGroupProps?: InputGroupProps;
};

export type InputNumberProps = Overwrite<InputProps, CustomProps>;

export const InputNumber = forwardRef<InputNumberProps, 'input'>(
  (
    {
      size,
      value,
      defaultValue,
      locale,
      currency = null,
      prefix = '',
      suffix = '',
      precision = 2,
      step = 1,
      bigStep = step * 10,
      min,
      max,
      clampValueOnBlur = true,
      fixedPrecision = false,
      onChange = () => undefined,
      placeholder,
      showButtons = true,
      inputGroupProps,
      ...rest
    },
    ref
  ) => {
    const { i18n } = useTranslation();
    const {
      decimalsSeparator,
      groupSeparator,
      currencyPrefix,
      currencySuffix,
    } = getNumberFormatInfo({
      locale: locale ?? i18n.language ?? DEFAULT_LANGUAGE_KEY,
      currency: currency ?? 'EUR',
    });

    const [internalValue, setInternalValue] = useState(
      value ?? defaultValue ?? null
    );
    const [isFocused, setIsFocused] = useState(false);
    const tmpValueRef = useRef(internalValue);

    const updateValue = (v: number | null) => {
      setInternalValue(v);
      onChange(v);
    };

    const getNumericFormatOptions = () =>
      ({
        getInputRef: ref,
        decimalScale: precision,
        fixedDecimalScale: !isFocused ? fixedPrecision : false,
        decimalSeparator: decimalsSeparator ?? '.',
        thousandSeparator: groupSeparator ?? ',',
        suffix: `${currency ? currencySuffix : ''}${suffix}`,
        prefix: `${currency ? currencyPrefix : ''}${prefix}`,
        onValueChange: (values) => {
          tmpValueRef.current = values.floatValue ?? null;

          // Prevent -0 to be replaced with 0 when input is controlled
          if (values.floatValue === 0) return;

          updateValue(values.floatValue ?? null);
        },
      }) satisfies ComponentProps<typeof NumericFormat>;

    return (
      <InputGroup size={size} {...inputGroupProps}>
        <Input
          as={NumericFormat}
          sx={{ fontVariantNumeric: 'tabular-nums' }}
          pe={showButtons ? 8 : undefined}
          {...rest}
          {...getNumericFormatOptions()}
          value={internalValue === undefined ? undefined : internalValue ?? ''}
          defaultValue={defaultValue ?? undefined}
          placeholder={
            typeof placeholder === 'number'
              ? numericFormatter(String(placeholder), {
                  ...getNumericFormatOptions(),
                  fixedDecimalScale: fixedPrecision,
                })
              : placeholder
          }
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            const v = tmpValueRef.current;
            updateValue(
              clampValueOnBlur
                ? v === null
                  ? null
                  : clamp(v, { min, max })
                : tmpValueRef.current
            );
            rest.onBlur?.(e);
          }}
          onKeyDown={(e) => {
            const v = tmpValueRef.current;

            if (e.key === 'Enter') {
              updateValue(v);
            }
            if (e.key === 'ArrowUp') {
              updateValue(
                clamp((v ?? 0) + (e.shiftKey ? bigStep : step), { min, max })
              );
            }
            if (e.key === 'ArrowDown') {
              updateValue(
                clamp((v ?? 0) - (e.shiftKey ? bigStep : step), { min, max })
              );
            }
            rest.onKeyDown?.(e);
          }}
        />
        {showButtons && (
          <ButtonGroup
            zIndex={2}
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            isAttached
            orientation="vertical"
            variant="unstyled"
            size="xs"
            borderStart="1px solid"
            borderStartColor="gray.200"
            _dark={{
              borderStartColor: 'gray.700',
            }}
          >
            <Button
              isDisabled={max !== undefined && (internalValue ?? 0) >= max}
              onClick={() => {
                updateValue(clamp((internalValue ?? 0) + step, { min, max }));
              }}
              display="flex"
              borderRadius={0}
              opacity={0.8}
              _hover={{
                opacity: 1,
              }}
              _active={{
                transform: 'translateY(-10%)',
              }}
            >
              <FaCaretUp />
            </Button>
            <Divider
              borderColor="gray.200"
              _dark={{
                borderColor: 'gray.700',
              }}
            />
            <Button
              isDisabled={min !== undefined && (internalValue ?? 0) <= min}
              onClick={() => {
                updateValue(clamp((internalValue ?? 0) - step, { min, max }));
              }}
              display="flex"
              borderRadius={0}
              opacity={0.8}
              _hover={{
                opacity: 1,
              }}
              _active={{
                transform: 'translateY(10%)',
              }}
            >
              <FaCaretDown />
            </Button>
          </ButtonGroup>
        )}
      </InputGroup>
    );
  }
);

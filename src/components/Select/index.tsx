import React, { ReactNode, useRef } from 'react';

import {
  Box,
  BoxProps,
  useColorModeValue,
  useStyleConfig,
  useTheme,
  useToken,
} from '@chakra-ui/react';
import type { CSSObject } from '@emotion/react';
import ReactSelect, { GroupBase, Props } from 'react-select';
import AsyncReactSelect from 'react-select/async';
import AsyncCreatableReactSelect from 'react-select/async-creatable';
import CreatableReactSelect from 'react-select/creatable';

const BoxAny: ExplicitAny = Box;

// Tricks for generic forwardRef. Do not move this declaration elsewhere as we
// do not want to apply it everywhere. The duplication is not a problem itself
// as this code won't be in the final bundle.
// https://fettblog.eu/typescript-react-generic-forward-refs/#option-3%3A-augment-forwardref
declare module 'react' {
  function forwardRef<T, P = unknown>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

export type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = {
  isAsync?: boolean;
  isCreatable?: boolean;
  isError?: boolean;
  size?: string;
  formatCreateLabel?: (inputValue: string) => ReactNode;
  loadOptions?: (input: unknown) => TODO;
  defaultOptions?: unknown | boolean;
  debounceDelay?: number;
} & Props<Option, IsMulti, Group> &
  Omit<BoxProps, 'defaultValue'>;

const SelectInner = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  {
    isAsync,
    isCreatable,
    isError,
    size = 'md',
    formatCreateLabel,
    placeholder,
    loadOptions = () => new Promise<void>((resolve) => resolve()),
    defaultOptions = true,
    debounceDelay = 500,
    styles = {},
    id,
    ...otherProps
  }: SelectProps<Option, IsMulti, Group>,
  ref: React.ForwardedRef<HTMLElement>
) => {
  const theme = useTheme();
  const isLightMode = useColorModeValue(true, false);

  const stylesFromTheme: TODO = useStyleConfig('Select', {
    size,
  });
  const [fieldFontSize] = useToken('fontSizes', [
    stylesFromTheme.field.fontSize,
  ]);
  const [
    fieldTextColor,
    fieldBg,
    fieldBorderColor,
    fieldFocusBorderColor,
    fieldErrorBorderColor,
  ] = useToken('colors', [
    stylesFromTheme.field.color,
    stylesFromTheme.field.bg,
    stylesFromTheme.field.borderColor,
    stylesFromTheme.field._focusVisible.borderColor,
    stylesFromTheme.field._invalid.borderColor,
  ]);
  const [fieldBorderRadius] = useToken('radii', [
    stylesFromTheme.field.borderRadius,
  ]);
  const [fieldHeight] = useToken('sizes', [stylesFromTheme.field.h]);

  const Element = (() => {
    if (isAsync && isCreatable) return AsyncCreatableReactSelect;
    if (isAsync) return AsyncReactSelect;
    if (isCreatable) return CreatableReactSelect;
    return ReactSelect;
  })();

  const debounceTimeout = useRef<ReturnType<typeof setTimeout>>();

  const debounce = (func: () => unknown, delay: number) => {
    if (debounceTimeout?.current) {
      clearTimeout(debounceTimeout.current);
    }
    return new Promise((resolve) => {
      debounceTimeout.current = setTimeout(async () => {
        resolve(func());
      }, delay);
    });
  };

  const asyncProps = isAsync
    ? {
        defaultOptions,
        cacheOptions: true,
        loadOptions: (input: unknown) =>
          debounce(() => loadOptions(input), debounceDelay),
      }
    : {};

  type State = {
    isDisabled: boolean;
    isFocused: boolean;
    isSelected: boolean;
  };

  const getComponentStyles = (
    componentName: keyof typeof styles,
    callback: (state: State) => CSSObject
  ) => ({
    [componentName]: (provided: CSSObject, state: State) => {
      const componentsStyles = callback(state);
      const combinedStyles = {
        ...provided,
        ...componentsStyles,
      };
      return (
        styles?.[componentName]?.(combinedStyles, state as TODO) ??
        combinedStyles
      );
    },
  });

  const getConditionalStyles = (
    condition: boolean,
    conditionalStyles: CSSObject
  ): CSSObject => (condition ? conditionalStyles : {});

  const selectStyle = {
    ...styles,
    ...getComponentStyles('input', () => ({
      color: fieldTextColor,
    })),
    ...getComponentStyles('singleValue', () => ({
      color: fieldTextColor,
    })),
    ...getComponentStyles('valueContainer', () => ({
      minHeight: `calc(${fieldHeight} - 2px)`,
      padding: '0',
      paddingLeft: '8px',
      paddingRight: '8px',
    })),
    ...getComponentStyles('indicatorsContainer', () => ({
      height: `calc(${fieldHeight} - 2px)`,
    })),
    ...getComponentStyles('multiValue', () => ({
      backgroundColor: isLightMode
        ? theme.colors.brand['100']
        : theme.colors.brand['300'],
    })),
    ...getComponentStyles('multiValueLabel', () => ({
      fontWeight: 'bold',
      color: isLightMode
        ? theme.colors.brand['800']
        : theme.colors.brand['900'],
    })),
    ...getComponentStyles('multiValueRemove', () => ({
      color: isLightMode
        ? theme.colors.brand['800']
        : theme.colors.brand['900'],
      opacity: 0.5,
      '&:hover': {
        background: 'transparent',
        color: isLightMode
          ? theme.colors.brand['800']
          : theme.colors.brand['900'],
        opacity: 1,
      },
    })),
    ...getComponentStyles('dropdownIndicator', () => ({
      paddingLeft: '0',
      paddingRight: '0.2rem',
    })),
    ...getComponentStyles('indicatorSeparator', () => ({
      display: 'none',
    })),
    ...getComponentStyles('control', ({ isFocused, isDisabled }) => ({
      color: fieldTextColor,
      fontSize: fieldFontSize,
      height: 'fit-content',
      minHeight: fieldHeight,
      borderRadius: fieldBorderRadius,
      borderColor: fieldBorderColor,
      backgroundColor: fieldBg,
      ...getConditionalStyles(isFocused && fieldFocusBorderColor, {
        borderColor: fieldFocusBorderColor,
        boxShadow: `0 0 0 1px ${fieldFocusBorderColor}`,
        '&:hover': {
          borderColor: fieldFocusBorderColor,
        },
      }),
      ...getConditionalStyles(!!isError, {
        borderColor: fieldErrorBorderColor,
        boxShadow: `0 0 0 1px ${fieldErrorBorderColor}`,
        '&:hover': {
          borderColor: fieldErrorBorderColor,
        },
      }),
      ...getConditionalStyles(isDisabled, {
        opacity: 0.6,
      }),
    })),
    ...getComponentStyles(
      'option',
      ({ isFocused, isDisabled, isSelected }) => ({
        fontSize: fieldFontSize,
        ':active': {
          backgroundColor: isLightMode
            ? theme.colors.gray['100']
            : theme.colors.blackAlpha['500'],
        },
        ...getConditionalStyles(isFocused, {
          backgroundColor: isLightMode
            ? theme.colors.gray['100']
            : theme.colors.blackAlpha['400'],
          color: isLightMode
            ? theme.colors.gray['600']
            : theme.colors.gray['100'],
        }),
        ...getConditionalStyles(isSelected, {
          backgroundColor: isLightMode
            ? theme.colors.gray['50']
            : theme.colors.blackAlpha['500'],
          color: isLightMode ? theme.colors.gray['700'] : 'white',
          borderLeft: `2px solid ${theme.colors.brand['500']}`,
        }),
        ...getConditionalStyles(isFocused && isSelected, {
          backgroundColor: isLightMode
            ? theme.colors.gray['100']
            : theme.colors.blackAlpha['400'],
          color: isLightMode
            ? theme.colors.gray['600']
            : theme.colors.gray['100'],
        }),
        ...getConditionalStyles(isDisabled, {
          opacity: 0.4,
        }),
      })
    ),
    ...getComponentStyles('menu', () => ({
      zIndex: 10,
      backgroundColor: isLightMode ? 'white' : theme.colors.gray['700'],
    })),
    ...getComponentStyles('menuPortal', () => ({
      zIndex: theme.zIndices.select,
    })),
  };

  return (
    <BoxAny
      as={Element}
      inputId={`select-input-${id}`}
      instanceId={`select-instance-${id}`}
      styles={selectStyle}
      menuPortalTarget={document.body}
      {...(formatCreateLabel ? { formatCreateLabel } : {})}
      placeholder={placeholder ? String(placeholder) : 'Select...'}
      menuPlacement="auto"
      ref={ref}
      {...asyncProps}
      {...otherProps}
    />
  );
};

export const Select = React.forwardRef(SelectInner);

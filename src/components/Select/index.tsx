import React, { forwardRef, useRef } from 'react';

import {
  Box,
  Portal,
  useToken,
  BoxProps,
  useTheme,
  useStyleConfig,
} from '@chakra-ui/react';
import type { CSSObject } from '@emotion/react';
import ReactSelect from 'react-select';
import type { Props } from 'react-select';
import AsyncReactSelect from 'react-select/async';
import AsyncCreatableReactSelect from 'react-select/async-creatable';
import CreatableReactSelect from 'react-select/creatable';

import { useDarkMode } from '@/hooks/useDarkMode';

const BoxAny: any = Box;

const MenuWithChakraPortal = ({ innerProps }: { innerProps: BoxProps }) => (
  <Portal>
    <Box {...innerProps} />
  </Portal>
);

export const Select = forwardRef<HTMLElement, Props>((props, ref) => {
  const {
    isAsync,
    isCreatable,
    isError,
    size = 'md',
    noOptionsMessage,
    loadingMessage,
    formatCreateLabel,
    placeholder,
    loadOptions = () => new Promise<void>((resolve) => resolve()),
    defaultOptions = true,
    debounceDelay = 500,
    styles = {},
    ...otherProps
  } = props;

  const theme = useTheme();
  const { colorModeValue } = useDarkMode();
  const stylesFromTheme: any = useStyleConfig('Select', {
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
  ] = useToken('colors', [
    stylesFromTheme.field.color,
    stylesFromTheme.field.bg,
    stylesFromTheme.field.borderColor,
    stylesFromTheme.field._focus.borderColor,
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

  let debounceTimeout = useRef<any>();

  const debounce = (func: () => unknown, delay: number) => {
    clearTimeout(debounceTimeout.current);
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

  type state = {
    isDisabled: boolean;
    isFocused: boolean;
    isSelected: boolean;
  };

  const getComponentStyles = (
    componentName: string,
    callback: (state: state) => CSSObject
  ) => ({
    [componentName]: (provided: CSSObject, state: state) => {
      const componentsStyles = callback(state);
      const combinedStyles = {
        ...provided,
        ...componentsStyles,
      };
      return styles?.[componentName]?.(combinedStyles, state) ?? combinedStyles;
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
      backgroundColor: colorModeValue(
        theme.colors.brand['100'],
        theme.colors.brand['300']
      ),
    })),
    ...getComponentStyles('multiValueLabel', () => ({
      fontWeight: 'bold',
      color: colorModeValue(
        theme.colors.brand['800'],
        theme.colors.brand['900']
      ),
    })),
    ...getComponentStyles('multiValueRemove', () => ({
      color: colorModeValue(
        theme.colors.brand['800'],
        theme.colors.brand['900']
      ),
      opacity: 0.5,
      '&:hover': {
        background: 'transparent',
        color: colorModeValue(
          theme.colors.brand['800'],
          theme.colors.brand['900']
        ),
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
      ...getConditionalStyles(isError, {
        borderColor: theme.colors.error[600],
        boxShadow: `0 0 0 1px ${theme.colors.error[600]}`,
        '&:hover': {
          borderColor: theme.colors.error[600],
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
          backgroundColor: colorModeValue(
            theme.colors.gray['100'],
            theme.colors.blackAlpha['500']
          ),
        },
        ...getConditionalStyles(isFocused, {
          backgroundColor: colorModeValue(
            theme.colors.gray['100'],
            theme.colors.blackAlpha['400']
          ),
          color: colorModeValue(
            theme.colors.gray['600'],
            theme.colors.gray['100']
          ),
        }),
        ...getConditionalStyles(isSelected, {
          backgroundColor: colorModeValue(
            theme.colors.gray['50'],
            theme.colors.blackAlpha['500']
          ),
          color: colorModeValue(theme.colors.gray['700'], 'white'),
          borderLeft: `2px solid ${theme.colors.brand['500']}`,
        }),
        ...getConditionalStyles(isFocused && isSelected, {
          backgroundColor: colorModeValue(
            theme.colors.gray['100'],
            theme.colors.blackAlpha['400']
          ),
          color: colorModeValue(
            theme.colors.gray['600'],
            theme.colors.gray['100']
          ),
        }),
        ...getConditionalStyles(isDisabled, {
          opacity: 0.4,
        }),
      })
    ),
    ...getComponentStyles('menu', () => ({
      zIndex: 10,
      backgroundColor: colorModeValue('white', theme.colors.gray['700']),
    })),
  };

  return (
    <BoxAny
      as={Element}
      styles={selectStyle}
      components={{ MenuPortal: MenuWithChakraPortal }}
      {...(noOptionsMessage
        ? { noOptionsMessage: () => noOptionsMessage }
        : {})}
      {...(loadingMessage ? { loadingMessage: () => loadingMessage } : {})}
      {...(formatCreateLabel ? { formatCreateLabel } : {})}
      placeholder={placeholder ? String(placeholder) : 'Select...'}
      menuPlacement="auto"
      ref={ref}
      {...asyncProps}
      {...otherProps}
    />
  );
});

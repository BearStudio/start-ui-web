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
  const stylesFromTheme: any = useStyleConfig('Select', {
    size,
  });
  const [fieldFontSize] = useToken('fontSizes', [
    stylesFromTheme.field.fontSize,
  ]);
  const [fieldBg, fieldBorderColor, fieldFocusBorderColor] = useToken(
    'colors',
    [
      stylesFromTheme.field.bg,
      stylesFromTheme.field.borderColor,
      stylesFromTheme.field._focus.borderColor,
    ]
  );
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
    ...getComponentStyles('control', ({ isFocused, isDisabled }) => ({
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
    ...getComponentStyles('option', ({ isFocused, isSelected }) => ({
      fontSize: fieldFontSize,
      ':active': {
        backgroundColor: theme.colors.brand['100'],
      },
      ...getConditionalStyles(isFocused, {
        backgroundColor: theme.colors.gray['100'],
        color: theme.colors.gray['600'],
      }),
      ...getConditionalStyles(isSelected, {
        backgroundColor: theme.colors.brand['50'],
        color: theme.colors.gray['700'],
        borderLeft: `2px solid ${theme.colors.brand['600']}`,
      }),
      ...getConditionalStyles(isFocused && isSelected, {
        backgroundColor: theme.colors.gray['100'],
      }),
    })),
    ...getComponentStyles('menu', () => ({
      zIndex: 10,
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
      backgroundColor: theme.colors.brand['100'],
    })),
    ...getComponentStyles('multiValueLabel', () => ({
      color: theme.colors.brand['800'],
      fontWeight: 'bold',
    })),
    ...getComponentStyles('multiValueRemove', () => ({
      color: 'inherit',
      opacity: 0.5,
      '&:hover': {
        background: 'transparent',
        color: 'inherit',
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

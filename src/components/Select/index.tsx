import React, { useRef, useState } from 'react';

import { Box, useToken, useTheme, useStyleConfig } from '@chakra-ui/react';
import ReactSelect, { CommonProps } from 'react-select';
import AsyncReactSelect from 'react-select/async';
import AsyncCreatableReactSelect from 'react-select/async-creatable';
import CreatableReactSelect from 'react-select/creatable';

export const Select: React.FC<CommonProps> = (props) => {
  const {
    isAsync,
    isCreatable,
    isDisabled,
    isError,
    size = 'md',
    noOptionsMessage,
    loadingMessage,
    formatCreateLabel,
    placeholder,
    loadOptions = () => new Promise<void>((resolve) => resolve()),
    defaultOptions = true,
    debounceDelay = 500,
    noPortal = false,
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

  const getSelectType = () => {
    if (isAsync && isCreatable) {
      return AsyncCreatableReactSelect;
    }
    if (isAsync) {
      return AsyncReactSelect;
    }
    if (isCreatable) {
      return CreatableReactSelect;
    }
    return ReactSelect;
  };

  const Element = getSelectType();

  let debounceTimeout = useRef<any>();

  const debounce = (func, delay: number) => {
    clearTimeout(debounceTimeout.current);
    return new Promise((resolve) => {
      debounceTimeout.current = setTimeout(async () => {
        const result = await func();
        resolve(result);
      }, delay);
    });
  };

  const asyncProps = isAsync
    ? {
        defaultOptions,
        cacheOptions: true,
        loadOptions: (input) =>
          debounce(() => loadOptions(input), debounceDelay),
      }
    : {};

  const selectStyle = {
    ...styles,
    control: (provided, data, ...args) => {
      const { isFocused } = data;
      const style = {
        ...provided,
        fontSize: fieldFontSize,
        height: 'fit-content',
        minHeight: fieldHeight,
        borderRadius: fieldBorderRadius,
        borderColor: fieldBorderColor,
        backgroundColor: fieldBg,
        ...(isFocused && fieldFocusBorderColor
          ? {
              borderColor: fieldFocusBorderColor,
              boxShadow: `0 0 0 1px ${fieldFocusBorderColor}`,
              '&:hover': {
                borderColor: fieldFocusBorderColor,
              },
            }
          : {}),
        ...(isError
          ? {
              borderColor: theme.colors.error[600],
              boxShadow: `0 0 0 1px ${theme.colors.error[600]}`,
              '&:hover': {
                borderColor: theme.colors.error[600],
              },
            }
          : {}),
        ...(isDisabled
          ? {
              backgroundColor: 'white',
            }
          : {}),
      };
      return styles?.control?.(style, data, ...args) ?? style;
    },
    option: (provided, data, ...args) => {
      const { isFocused, isSelected } = data;
      const style = {
        ...provided,
        fontSize: fieldFontSize,
        ...(isFocused
          ? {
              backgroundColor: theme.colors.gray['100'],
              color: theme.colors.gray['600'],
            }
          : {}),
        ...(isSelected
          ? {
              backgroundColor: theme.colors.brand['50'],
              color: theme.colors.gray['700'],
              borderLeft: `2px solid ${theme.colors.brand['600']}`,
            }
          : {}),
        ...(isFocused && isSelected
          ? {
              backgroundColor: theme.colors.gray['100'],
            }
          : {}),
        ...{
          ':active': {
            backgroundColor: theme.colors.brand['100'],
          },
        },
      };
      return styles?.option?.(style, data, ...args) ?? style;
    },
    menu: (provided, ...args) => {
      const style = {
        ...provided,
        zIndex: 10,
      };
      return styles?.menu?.(style, ...args) ?? style;
    },
    valueContainer: (provided, ...args) => {
      const style = {
        ...provided,
        minHeight: `calc(${fieldHeight} - 2px)`,
        padding: '0',
        paddingLeft: '8px',
        paddingRight: '8px',
      };
      return styles?.valueContainer?.(style, ...args) ?? style;
    },
    indicatorsContainer: (provided, ...args) => {
      const style = {
        ...provided,
        height: `calc(${fieldHeight} - 2px)`,
      };
      return styles?.indicatorsContainer?.(style, ...args) ?? style;
    },
    multiValue: (provided, ...args) => {
      const style = {
        ...provided,
        backgroundColor: theme.colors.brand['100'],
      };
      return styles?.multiValue?.(style, ...args) ?? style;
    },
    multiValueLabel: (provided, ...args) => {
      const style = {
        ...provided,
        color: theme.colors.brand['800'],
        fontWeight: 'bold',
      };
      return styles?.multiValueLabel?.(style, ...args) ?? style;
    },
    multiValueRemove: (provided, ...args) => {
      const style = {
        ...provided,
        color: 'inherit',
        opacity: 0.5,
        ...{
          '&:hover': {
            background: 'transparent',
            color: 'inherit',
            opacity: 1,
          },
        },
      };
      return styles?.multiValueRemove?.(style, ...args) ?? style;
    },
    dropdownIndicator: (provided, ...args) => {
      const style = {
        ...provided,
        paddingLeft: '0',
        paddingRight: '0.2rem',
      };
      return styles?.dropdownIndicator?.(style, ...args) ?? style;
    },
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Box
      as={Element}
      styles={selectStyle}
      isDisabled={isDisabled}
      {...(noOptionsMessage
        ? { noOptionsMessage: () => noOptionsMessage }
        : {})}
      {...(loadingMessage ? { loadingMessage: () => loadingMessage } : {})}
      {...(formatCreateLabel ? { formatCreateLabel } : {})}
      placeholder={placeholder}
      menuPlacement="auto"
      onKeyDown={(event) => {
        if (isMenuOpen) {
          event.stopPropagation();
        }
      }}
      onMenuOpen={() => setIsMenuOpen(true)}
      onMenuClose={() => setIsMenuOpen(false)}
      {...(noPortal ? {} : { menuPortalTarget: document.body })}
      {...asyncProps}
      {...otherProps}
    />
  );
};

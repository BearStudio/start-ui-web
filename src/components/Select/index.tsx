import React, { FC, useRef } from 'react';

import { Box } from '@chakra-ui/react';
import ReactSelect, { IndicatorProps } from 'react-select';
import AsyncReactSelect from 'react-select/async';
import AsyncCreatableReactSelect from 'react-select/async-creatable';
import CreatableReactSelect from 'react-select/creatable';

import extendTheme from '@/theme/index';

interface SelectProps extends IndicatorProps<any, any, any> {
  focusBorderColor: string;
  errorBorderColor: string;
  optionsColor: {
    hover: string;
    selected: string;
    active: string;
  };
  isAsync: boolean;
  isCreatable: boolean;
  isError: boolean;
  noOptionsMessage: string;
  loadingMessage: string;
  formatCreateLabel: () => void;
  placeholder: string;
  loadOptions: (arg: string) => Promise<void>;
  defaultOptions: boolean | Array<object>;
  debounceDelay: number;
  containerProps: object;
}

export const Select: FC<SelectProps> = ({
  errorBorderColor,
  focusBorderColor,
  optionsColor,
  isAsync,
  isCreatable,
  isError,
  noOptionsMessage,
  loadingMessage,
  formatCreateLabel,
  placeholder,
  loadOptions = () => new Promise<void>((resolve) => resolve()),
  defaultOptions = true,
  debounceDelay = 500,
  containerProps = {},
  ...otherProps
}) => {
  const Element =
    isAsync && isCreatable
      ? AsyncCreatableReactSelect
      : isAsync
      ? AsyncReactSelect
      : isCreatable
      ? CreatableReactSelect
      : ReactSelect;

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
    control: (provided, { isFocused }) => {
      const borderColor = extendTheme.colors.brand['500']; // to have the same border colors than the inputs

      if (isFocused) {
        return {
          ...provided,
          ...(borderColor
            ? {
                borderColor,
                boxShadow: `0 0 0 1px ${borderColor}`,
                '&:hover': { borderColor },
              }
            : {}),
        };
      }
      return provided;
    },

    option: (provided, { isFocused, isSelected }) => {
      let backgroundColor = null;
      let color = null;
      if (isFocused) {
        backgroundColor = extendTheme.colors.gray['100'];
        color = 'black';
      } else if (isSelected) {
        backgroundColor = extendTheme.colors.gray['500'];
        color = 'white';
      }

      return {
        ...provided,
        ...(backgroundColor && color
          ? {
              backgroundColor,
              color,
              ':active': {
                backgroundColor: extendTheme.colors.gray['500'],
                color: 'white',
              },
            }
          : {}),
      };
    },
    menu: (provided) => ({ ...provided, zIndex: 10 }),
  };

  const selectErrorStyle = {
    control: (provided, state) => {
      if (isError) {
        const borderColor = extendTheme.colors.error['500'];

        return {
          ...provided,
          borderColor,
          boxShadow: `0 0 0 1px ${borderColor}`,
          '&:hover': { borderColor },
        };
      }

      return { ...provided, ...selectStyle.control(provided, state) };
    },
  };

  return (
    <Box {...containerProps}>
      <Element
        styles={{ ...selectStyle, ...selectErrorStyle }}
        {...(noOptionsMessage
          ? { noOptionsMessage: () => noOptionsMessage }
          : {})}
        {...(loadingMessage ? { loadingMessage: () => loadingMessage } : {})}
        {...(formatCreateLabel ? { formatCreateLabel } : {})}
        placeholder={placeholder}
        {...asyncProps}
        {...otherProps}
      />
    </Box>
  );
};

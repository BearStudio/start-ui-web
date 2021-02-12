import React, { useRef } from 'react';

import { Box, ChakraComponent, SelectProps } from '@chakra-ui/react';
import ReactSelect from 'react-select';
import AsyncReactSelect from 'react-select/async';
import AsyncCreatableReactSelect from 'react-select/async-creatable';
import CreatableReactSelect from 'react-select/creatable';

interface CustomSelectProps extends SelectProps {
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

export const Select: ChakraComponent<'select', CustomSelectProps> = ({
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
      const borderColor = 'blue.500'; // to have the same border colors than the inputs

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
        backgroundColor = 'info.100';
        color = 'black';
      } else if (isSelected) {
        backgroundColor = 'info.500';
        color = 'white';
      }

      return {
        ...provided,
        ...(backgroundColor && color
          ? {
              backgroundColor,
              color,
              ':active': {
                backgroundColor: 'info.500',
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
        const borderColor = 'danger.500';

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

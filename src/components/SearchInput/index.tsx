import React, { useEffect, useRef, useState } from 'react';

import {
  forwardRef,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  IconButton,
  useControllableState,
} from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';

import mergeRefs from '@/utils/mergeRefs';

interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  onChange?(value?: string): void;
  delay?: number;
  clearLabel?: string;
}

export const SearchInput = forwardRef<SearchInputProps, 'input'>(
  (
    {
      value,
      defaultValue,
      onChange,
      delay = 500,
      placeholder = 'Search...',
      clearLabel = 'Clear Search',
      isDisabled = false,
      ...rest
    },
    ref
  ) => {
    const [externalValue, setExternalValue]: any = useControllableState({
      name: 'SearchInput',
      value,
      defaultValue,
      onChange,
    });
    const inputRef = useRef<HTMLInputElement>();

    const [search, setSearch] = useState<string>(externalValue as string);

    const searchRef = useRef(search);
    searchRef.current = search;

    const setExternalValueRef = useRef<SearchInputProps['onChange']>();
    setExternalValueRef.current = setExternalValue;

    useEffect(() => {
      const handler = setTimeout(() => {
        setExternalValueRef.current(search);
      }, delay);

      return () => clearTimeout(handler);
    }, [search, delay]);

    useEffect(() => {
      if (externalValue !== searchRef.current) {
        setSearch(externalValue);
      }
    }, [externalValue]);

    const handleChange = (event) => {
      setSearch(event.target.value);
    };

    const handleClear = () => {
      setSearch('');
      inputRef?.current?.focus();
    };

    const handleEscape = (event) => {
      if (event?.key?.toLowerCase() === 'escape') {
        handleClear();
      }
    };

    return (
      <InputGroup {...rest}>
        <Input
          ref={mergeRefs([inputRef, ref])}
          onChange={handleChange}
          value={search}
          placeholder={placeholder}
          isDisabled={isDisabled}
          onKeyDown={handleEscape}
        />
        <InputRightElement color={isDisabled ? 'gray.300' : 'brand.600'}>
          {!isDisabled && search ? (
            <IconButton
              onClick={handleClear}
              variant="@secondary"
              size="xs"
              aria-label={clearLabel}
            >
              <FiX />
            </IconButton>
          ) : (
            <FiSearch />
          )}
        </InputRightElement>
      </InputGroup>
    );
  }
);

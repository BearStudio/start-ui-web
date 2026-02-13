import { SearchIcon, XIcon } from 'lucide-react';
import React, {
  ComponentProps,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { mergeRefs } from 'react-merge-refs';

import { cn } from '@/lib/tailwind/utils';
import { useValueHasChanged } from '@/hooks/use-value-has-changed';

import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';

type CustomProps = {
  value?: string;
  defaultValue?: string;
  onChange?(value?: string): void;
  delay?: number;
  clearLabel?: string;
  loading?: boolean;
};

type SearchInputProps = Overwrite<ComponentProps<typeof Input>, CustomProps>;

export const SearchInput = ({
  ref,
  value,
  defaultValue,
  className,
  onChange,
  delay = 500,
  placeholder,
  clearLabel,
  disabled = false,
  loading = false,
  size,
  ...rest
}: SearchInputProps & { ref?: React.RefObject<HTMLInputElement | null> }) => {
  const { t } = useTranslation(['components']);
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = mergeRefs([ref, internalRef]);

  const [search, setSearch] = useState<string>(value ?? defaultValue ?? '');

  const onChangeEvent = useEffectEvent((s: string) => {
    onChange?.(s);
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChangeEvent(search);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [search, delay]);

  const externalValueHasChanged = useValueHasChanged(value);
  if (externalValueHasChanged && value !== search) {
    setSearch(value ?? '');
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClear = () => {
    setSearch('');
    internalRef.current?.focus();
  };

  const handleEscape = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event?.key?.toLowerCase() === 'escape') {
      handleClear();
    }
    rest.onKeyDown?.(event);
  };

  const getEndElement = () => {
    if (loading) return <Spinner />;
    if (!disabled && search)
      return (
        <InputGroupButton
          onClick={handleClear}
          variant="ghost"
          size="icon-xs"
          className="mr-0.5"
        >
          <span className="sr-only">
            {clearLabel ?? t('components:searchInput.clear')}
          </span>
          <XIcon />
        </InputGroupButton>
      );
    return <SearchIcon className={cn(disabled && 'opacity-30')} />;
  };

  return (
    <InputGroup size={size} className={className}>
      <InputGroupInput
        {...rest}
        ref={inputRef}
        onChange={handleChange}
        value={search || ''}
        placeholder={placeholder ?? t('components:searchInput.placeholder')}
        onKeyDown={handleEscape}
        disabled={disabled}
      />
      <InputGroupAddon align="inline-end">{getEndElement()}</InputGroupAddon>
    </InputGroup>
  );
};

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

  // The last text sent: a `value` that comes back as it is only catches up with the input, it does not replace what
  // was typed since.
  const [sent, setSent] = useState<string | undefined>(value ?? defaultValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const send = (s: string) => {
    timeoutRef.current = undefined;
    setSent(s);
    onChangeEvent(s);
  };
  const sendEvent = useEffectEvent(send);
  useEffect(() => {
    timeoutRef.current = setTimeout(() => sendEvent(search), delay);

    return () => clearTimeout(timeoutRef.current);
  }, [search, delay]);

  // Leaving the input with a search on its way runs it, so a click that follows (a reset, a link) acts on it.
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (timeoutRef.current !== undefined && search !== sent) {
      clearTimeout(timeoutRef.current);
      send(search);
    }
    rest.onBlur?.(event);
  };

  const externalValueHasChanged = useValueHasChanged(value);
  if (
    externalValueHasChanged &&
    value !== search &&
    // A text of blanks sent comes back as no search: the blanks typed stay.
    (value ?? '') !== ((sent ?? '').trim() === '' ? '' : (sent ?? ''))
  ) {
    setSent(value);
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
    // Escape while composing (an IME) cancels the composition, not the search.
    if (
      event?.key?.toLowerCase() === 'escape' &&
      !event.nativeEvent.isComposing
    ) {
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
          className="me-0.5"
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
        onBlur={handleBlur}
        disabled={disabled}
      />
      <InputGroupAddon align="inline-end">{getEndElement()}</InputGroupAddon>
    </InputGroup>
  );
};

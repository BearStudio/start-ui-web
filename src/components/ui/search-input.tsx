import { SearchIcon, XIcon } from 'lucide-react';
import React, {
  ComponentProps,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';
import { useValueHasChanged } from '@/hooks/use-value-has-changed';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  onChange,
  delay = 500,
  placeholder,
  clearLabel,
  disabled = false,
  loading = false,
  ...rest
}: SearchInputProps & { ref?: React.RefObject<HTMLInputElement | null> }) => {
  const { t } = useTranslation(['components']);
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = ref ?? internalRef;

  const [search, setSearch] = useState<string>(value ?? '');

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
    inputRef.current?.focus();
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
        <Button
          onClick={handleClear}
          variant="ghost"
          size="icon-xs"
          className="-mr-1.5"
        >
          <span className="sr-only">
            {clearLabel ?? t('components:searchInput.clear')}
          </span>
          <XIcon />
        </Button>
      );
    return <SearchIcon className={cn(disabled && 'opacity-30')} />;
  };

  return (
    <Input
      {...rest}
      ref={inputRef}
      onChange={handleChange}
      value={search || ''}
      placeholder={placeholder ?? t('components:searchInput.placeholder')}
      onKeyDown={handleEscape}
      disabled={disabled}
      endElement={getEndElement()}
    />
  );
};

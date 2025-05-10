import { SearchIcon } from 'lucide-react';
import { ComponentProps, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { SearchInput } from '@/components/ui/search-input';
import { Spinner } from '@/components/ui/spinner';

type Props = Omit<ComponentProps<typeof Button>, 'children' | 'onChange'> &
  Pick<ComponentProps<typeof SearchInput>, 'value' | 'onChange'> & {
    loading?: boolean;
    inputProps?: Omit<ComponentProps<typeof SearchInput>, 'value' | 'onChange'>;
  };

const SearchButtonComponent = ({
  value,
  onChange,
  loading,
  inputProps,
  ...props
}: Props) => {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  return (
    <Drawer
      direction="top"
      autoFocus
      open={open}
      onOpenChange={(o) => {
        onChange?.(internalValue ?? '');
        setOpen(o);
      }}
    >
      <DrawerTrigger asChild>
        <Button size="icon" variant="ghost" {...props}>
          {loading ? <Spinner /> : <SearchIcon />}
          <span className="sr-only">Search</span> {/* TODO translation */}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="pt-safe-top">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Search</DrawerTitle> {/* TODO translation */}
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="py-4">
          <SearchInput
            value={internalValue}
            delay={0}
            onChange={setInternalValue}
            size="lg"
            {...inputProps}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setOpen(false);
                onChange?.(internalValue ?? '');
              }
              inputProps?.onKeyDown?.(event);
            }}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export const SearchButton = (props: Props) => {
  return <SearchButtonComponent key={props.value} {...props} />;
};

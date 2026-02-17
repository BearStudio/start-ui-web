import { SearchIcon } from 'lucide-react';
import { ComponentProps, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  } & { label?: ReactNode };

const SearchButtonComponent = ({
  value,
  onChange,
  loading,
  inputProps,
  label,
  ...props
}: Props) => {
  const { t } = useTranslation(['components']);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  return (
    <Drawer
      swipeDirection="up"
      open={open}
      onOpenChange={(o) => {
        onChange?.(internalValue ?? '');
        setOpen(o);
      }}
    >
      <DrawerTrigger render={<Button size="icon" variant="ghost" {...props} />}>
        {loading ? <Spinner /> : <SearchIcon />}
        <span className="sr-only">
          {label || t('components:searchButton.label')}
        </span>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>
            {label || t('components:searchButton.label')}
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="py-4">
          <SearchInput
            value={internalValue}
            delay={0}
            onChange={setInternalValue}
            size="lg"
            autoFocus // Force iOS to open the keyboard
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

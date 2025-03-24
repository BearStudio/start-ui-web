import { CheckIcon, ChevronsUpDownIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from 'react-use-disclosure';

import { cn } from '@/lib/tailwind/utils';
import { useTheme } from '@/lib/theme/client';
import { DEFAULT_THEME, Theme, themes } from '@/lib/theme/config';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const ThemeSwitcher = (props: { iconOnly?: boolean }) => {
  const { t } = useTranslation(['common']);
  const { theme, setTheme } = useTheme();
  const popover = useDisclosure();
  return (
    <Popover
      open={popover.isOpen}
      onOpenChange={(isOpen) => popover.toggle(isOpen)}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={props.iconOnly ? 'ghost' : 'link'}
          size={props.iconOnly ? 'icon' : 'default'}
          role="combobox"
          aria-expanded={popover.isOpen}
        >
          {theme === 'dark' ? (
            <MoonIcon className="opacity-50" />
          ) : (
            <SunIcon className="opacity-50" />
          )}
          <span className={cn(props.iconOnly && 'sr-only')}>
            {t(`common:themes.${theme ?? DEFAULT_THEME}`)}
          </span>
          {!props.iconOnly && <ChevronsUpDownIcon className="opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {themes.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={(currentValue) => {
                    setTheme(currentValue as Theme);
                    popover.close();
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'size-4',
                      theme === item ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {t(`common:themes.${item}`)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

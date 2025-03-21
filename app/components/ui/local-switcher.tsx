import { CheckIcon, ChevronsUpDownIcon, LanguagesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from 'react-use-disclosure';

import { AVAILABLE_LANGUAGES, LanguageKey } from '@/lib/i18n/constants';
import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const LocalSwitcher = () => {
  const { i18n, t } = useTranslation(['common']);
  const popover = useDisclosure();
  return (
    <Popover
      open={popover.isOpen}
      onOpenChange={(isOpen) => popover.toggle(isOpen)}
    >
      <PopoverTrigger asChild>
        <Button variant="link" role="combobox" aria-expanded={popover.isOpen}>
          <LanguagesIcon className="opacity-50" />
          {t(`common:languages.${i18n.language as LanguageKey}`)}
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          {AVAILABLE_LANGUAGES.length > 6 && (
            <CommandInput placeholder="Search language..." />
          )}
          <CommandList>
            <CommandEmpty>No language found</CommandEmpty>
            <CommandGroup>
              {AVAILABLE_LANGUAGES.map((language) => (
                <CommandItem
                  key={language.key}
                  value={language.key}
                  onSelect={(currentValue) => {
                    i18n.changeLanguage(currentValue);
                    popover.close();
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 size-4',
                      i18n.language === language.key
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {t(`common:languages.${language.key}`)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

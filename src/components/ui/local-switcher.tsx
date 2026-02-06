import { CheckIcon, ChevronsUpDownIcon, LanguagesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AVAILABLE_LANGUAGES, LanguageKey } from '@/lib/i18n/constants';
import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const LocalSwitcher = (props: { iconOnly?: boolean }) => {
  const { i18n, t } = useTranslation(['common']);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={props.iconOnly ? 'ghost' : 'link'}
            size={props.iconOnly ? 'icon' : 'default'}
          />
        }
      >
        <LanguagesIcon className="opacity-50" />
        <span className={cn(props.iconOnly && 'sr-only')}>
          {t(`common:languages.values.${i18n.language as LanguageKey}`)}
        </span>
        {!props.iconOnly && <ChevronsUpDownIcon className="opacity-50" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {AVAILABLE_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.key}
            onClick={() => {
              i18n.changeLanguage(language.key);
            }}
          >
            <CheckIcon
              className={cn(
                'mt-0.5 size-4 self-start text-current',
                i18n.language === language.key ? 'opacity-100' : 'opacity-0'
              )}
            />
            <span className="flex flex-col">
              <span>{t(`common:languages.values.${language.key}`)}</span>
              {language.key !== i18n.language && (
                <span className="text-xs opacity-60">
                  {t(`common:languages.values.${language.key}`, {
                    lng: language.key,
                  })}
                </span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

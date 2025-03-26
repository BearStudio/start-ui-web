import { CheckIcon, ChevronsUpDownIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';
import { useTheme } from '@/lib/theme/client';
import { DEFAULT_THEME, themes } from '@/lib/theme/config';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ThemeSwitcher = (props: { iconOnly?: boolean }) => {
  const { t } = useTranslation(['common']);
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={props.iconOnly ? 'ghost' : 'link'}
          size={props.iconOnly ? 'icon' : 'default'}
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
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {themes.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => {
              setTheme(item);
            }}
          >
            <CheckIcon
              className={cn(
                'mt-0.5 size-4 self-start',
                theme === item ? 'opacity-100' : 'opacity-0'
              )}
            />
            {t(`common:themes.${item}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import {
  CheckIcon,
  ChevronsUpDownIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { cn } from '@/lib/tailwind/utils';
import { useHydrated } from '@/hooks/use-hydrated';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const themes = ['system', 'light', 'dark'] as const;

export const ThemeSwitcher = (props: { iconOnly?: boolean }) => {
  const { t } = useTranslation(['common']);
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className="size-9" />;
  }

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
        {match(theme as (typeof themes)[number])
          .with('system', () => <SunMoonIcon className="opacity-50" />)
          .with('light', () => <SunIcon className="opacity-50" />)
          .with('dark', () => <MoonIcon className="opacity-50" />)
          .exhaustive()}
        <span className={cn(props.iconOnly && 'sr-only')}>
          {match(theme as (typeof themes)[number])
            .with('system', () => t('common:themes.values.system'))
            .with('light', () => t('common:themes.values.light'))
            .with('dark', () => t('common:themes.values.dark'))
            .exhaustive()}
        </span>
        {!props.iconOnly && <ChevronsUpDownIcon className="opacity-50" />}
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
                'mt-0.5 size-4 self-start text-current',
                theme === item ? 'opacity-100' : 'opacity-0'
              )}
            />
            {t(`common:themes.values.${item}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

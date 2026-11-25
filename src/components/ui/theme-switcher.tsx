import {
  CheckIcon,
  ChevronsUpDownIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { colorSchemes, useColorScheme } from '@/lib/preferences';
import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ThemeSwitcher = (props: { iconOnly?: boolean }) => {
  const { t } = useTranslation(['common']);
  const colorScheme = useColorScheme();

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
        {match(colorScheme.value)
          .with('system', () => <SunMoonIcon className="opacity-50" />)
          .with('light', () => <SunIcon className="opacity-50" />)
          .with('dark', () => <MoonIcon className="opacity-50" />)
          .exhaustive()}
        <span className={cn(props.iconOnly && 'sr-only')}>
          {match(colorScheme.value)
            .with('system', () => t('common:themes.values.system'))
            .with('light', () => t('common:themes.values.light'))
            .with('dark', () => t('common:themes.values.dark'))
            .exhaustive()}
        </span>
        {!props.iconOnly && <ChevronsUpDownIcon className="opacity-50" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {colorSchemes.map((item) => (
          <DropdownMenuItem
            key={item}
            onSelect={() => {
              colorScheme.set(item);
            }}
          >
            <CheckIcon
              className={cn(
                'mt-0.5 size-4 self-start text-current',
                colorScheme.value === item ? 'opacity-100' : 'opacity-0'
              )}
            />
            {t(`common:themes.values.${item}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

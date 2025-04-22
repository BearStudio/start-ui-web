import { NumberInput as N } from '@ark-ui/react/number-input';
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type InputProps = ComponentProps<typeof Input>;
type InputPropsRoot = Pick<InputProps, 'placeholder'>;

type NumberInputProps = N.RootProps &
  InputPropsRoot & {
    inputProps?: Omit<RemoveFromType<InputProps, InputPropsRoot>, 'endElement'>;
    buttons?: 'classic' | 'mobile';
  };

export const NumberInput = ({
  inputProps,
  placeholder,
  locale,
  buttons,
  className,
  ...props
}: NumberInputProps) => {
  const { i18n } = useTranslation();

  const _locale = locale ?? i18n.language;

  return (
    <N.Root {...props} locale={_locale} className={cn('flex gap-1', className)}>
      {buttons === 'mobile' && (
        <N.Control className="flex flex-col">
          <N.DecrementTrigger asChild>
            <Button variant="secondary" size="icon">
              <Minus />
            </Button>
          </N.DecrementTrigger>
        </N.Control>
      )}

      <N.Input asChild>
        <Input
          endElement={
            buttons === 'classic' && (
              <N.Control className="flex flex-col">
                <N.IncrementTrigger>
                  <ChevronUp />
                </N.IncrementTrigger>
                <N.DecrementTrigger>
                  <ChevronDown />
                </N.DecrementTrigger>
              </N.Control>
            )
          }
          placeholder={placeholder}
          {...inputProps}
        />
      </N.Input>

      {buttons === 'mobile' && (
        <N.Control className="flex flex-col">
          <N.IncrementTrigger asChild>
            <Button variant="secondary" size="icon">
              <Plus />
            </Button>
          </N.IncrementTrigger>
        </N.Control>
      )}
    </N.Root>
  );
};

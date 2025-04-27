import { NumberField } from '@base-ui-components/react';
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type InputProps = ComponentProps<typeof Input>;
type InputPropsRoot = Pick<InputProps, 'placeholder'>;

type NumberInputProps = ComponentProps<typeof NumberField.Root> &
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
    <NumberField.Root {...props} locale={_locale} className={cn(className)}>
      <NumberField.Group className="flex gap-2">
        {buttons === 'mobile' && (
          <NumberField.Decrement
            render={<Button variant="secondary" size="icon" />}
          >
            <Minus />
          </NumberField.Decrement>
        )}
        <NumberField.Input
          render={
            <Input
              endElement={
                buttons === 'classic' && (
                  <NumberField.Group className="flex flex-col">
                    <NumberField.Increment>
                      <ChevronUp />
                    </NumberField.Increment>
                    <NumberField.Decrement>
                      <ChevronDown />
                    </NumberField.Decrement>
                  </NumberField.Group>
                )
              }
              placeholder={placeholder}
              {...inputProps}
            />
          }
        />
        {buttons === 'mobile' && (
          <NumberField.Increment
            render={<Button variant="secondary" size="icon" />}
          >
            <Plus />
          </NumberField.Increment>
        )}
      </NumberField.Group>
    </NumberField.Root>
  );
};

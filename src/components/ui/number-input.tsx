import {
  NumberInput as NumberInputPrimitive,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from '@ui-sdk/react/number-input';
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { cn } from '@/lib/tailwind/utils';

import { buttonVariants } from '@/components/ui/button';
import type { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

type InputProps = ComponentProps<typeof Input>;
type InputPropsRoot = Pick<
  InputProps,
  'placeholder' | 'size' | 'id' | 'aria-invalid' | 'aria-describedby'
> &
  Pick<ComponentProps<'input'>, 'aria-label' | 'aria-labelledby'>;

type NumberInputProps = Omit<
  ComponentProps<typeof NumberInputPrimitive>,
  'className' | 'children' | keyof InputPropsRoot
> &
  InputPropsRoot & {
    className?: string;
    inputProps?: Omit<RemoveFromType<InputProps, InputPropsRoot>, 'endElement'>;
    buttons?: 'classic' | 'mobile';
    inCents?: boolean;
  } & {
    ref?: React.Ref<HTMLInputElement | null>;
  };

export const NumberInput = ({
  inputProps,
  size,
  placeholder,
  locale,
  buttons,
  className,
  ref,
  id,
  'aria-invalid': invalid,
  'aria-describedby': describedBy,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  ...props
}: NumberInputProps) => {
  const { t, i18n } = useTranslation(['components']);
  const buttonSize = match(size)
    .with('default', undefined, null, () => 'icon' as const)
    .with('sm', () => 'icon-sm' as const)
    .with('lg', () => 'icon-lg' as const)
    .exhaustive();

  return (
    <NumberInputPrimitive
      {...props}
      locale={locale ?? i18n.language}
      className={cn(className)}
    >
      <NumberInputGroup className="flex gap-2">
        {buttons === 'mobile' && (
          <NumberInputDecrement
            aria-label={t('components:numberInput.decrement')}
            className={buttonVariants({
              variant: 'secondary',
              size: buttonSize,
            })}
          >
            <Minus />
          </NumberInputDecrement>
        )}
        <InputGroup size={size}>
          <NumberInputControl
            id={id}
            aria-describedby={describedBy}
            aria-label={label}
            aria-labelledby={labelledBy}
            aria-invalid={invalid}
            ref={ref}
            placeholder={placeholder}
            inputMode="decimal"
            render={<InputGroupInput />}
            {...inputProps}
          />
          {buttons === 'classic' && (
            <InputGroupAddon
              align="inline-end"
              className="flex flex-col gap-0 py-0"
            >
              <NumberInputIncrement
                aria-label={t('components:numberInput.increment')}
              >
                <ChevronUp />
              </NumberInputIncrement>
              <NumberInputDecrement
                aria-label={t('components:numberInput.decrement')}
              >
                <ChevronDown />
              </NumberInputDecrement>
            </InputGroupAddon>
          )}
        </InputGroup>

        {buttons === 'mobile' && (
          <NumberInputIncrement
            aria-label={t('components:numberInput.increment')}
            className={buttonVariants({
              variant: 'secondary',
              size: buttonSize,
            })}
          >
            <Plus />
          </NumberInputIncrement>
        )}
      </NumberInputGroup>
    </NumberInputPrimitive>
  );
};

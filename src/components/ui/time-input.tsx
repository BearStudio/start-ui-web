import { Time } from '@internationalized/date';
import { ReactNode } from 'react';
import {
  composeRenderProps,
  DateInput as AriaDateInput,
  DateInputProps as AriaDateInputProps,
  DateSegment as AriaDateSegment,
  DateSegmentProps as AriaDateSegmentProps,
  TimeField as AriaTimeField,
  TimeFieldProps as AriaTimeFieldProps,
  useLocale,
} from 'react-aria-components';

import { cn } from '@/lib/tailwind/utils';

import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';

type TimeValue = {
  hour: number;
  minute: number;
  second?: number;
  millisecond?: number;
};

function toAriaTime(value: TimeValue): Time {
  return new Time(value.hour, value.minute, value.second, value.millisecond);
}

function fromAriaTime(time: Time): TimeValue {
  return {
    hour: time.hour,
    minute: time.minute,
    second: time.second,
    millisecond: time.millisecond,
  };
}

function getHourCycle(locale: string): 12 | 24 {
  try {
    const { hourCycle } = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
    }).resolvedOptions();
    return hourCycle === 'h11' || hourCycle === 'h12' ? 12 : 24;
  } catch {
    return 12;
  }
}

function DateSegment({ className, ...props }: AriaDateSegmentProps) {
  return (
    <AriaDateSegment
      className={composeRenderProps(className, (className) =>
        cn(
          'type-literal:px-0 inline rounded p-0.5 caret-transparent outline-0',
          /* Placeholder */
          'data-placeholder:text-muted-foreground',
          /* Disabled */
          'data-disabled:cursor-not-allowed data-disabled:opacity-50',
          /* Focused */
          'data-focused:bg-accent data-focused:text-accent-foreground',
          /* Invalid */
          'data-invalid:text-destructive data-invalid:data-focused:bg-destructive data-invalid:data-focused:text-destructive-foreground data-invalid:data-placeholder:text-destructive data-invalid:data-focused:data-placeholder:text-destructive-foreground',
          className
        )
      )}
      {...props}
    />
  );
}

function DateInput({
  className,
  ...props
}: Omit<AriaDateInputProps, 'children'>) {
  return (
    <AriaDateInput
      className={composeRenderProps(className, (className) =>
        cn('flex h-full w-full flex-1 items-center', className)
      )}
      {...props}
    >
      {(segment) => <DateSegment segment={segment} />}
    </AriaDateInput>
  );
}

type TimeInputProps = Omit<
  AriaTimeFieldProps<Time>,
  'className' | 'children' | 'value' | 'defaultValue' | 'onChange'
> &
  Pick<React.ComponentProps<typeof InputGroup>, 'size'> & {
    className?: string;
    startAddon?: ReactNode;
    endAddon?: ReactNode;
    value?: TimeValue | null;
    defaultValue?: TimeValue | null;
    onChange?: (value: TimeValue) => void;
  };

function TimeInput({
  className,
  size,
  startAddon,
  endAddon,
  hourCycle,
  value,
  defaultValue,
  onChange,
  ...props
}: TimeInputProps) {
  const { locale } = useLocale();
  const resolvedHourCycle = hourCycle ?? getHourCycle(locale);

  return (
    <AriaTimeField
      hourCycle={resolvedHourCycle}
      data-slot="time-input"
      value={value ? toAriaTime(value) : (value ?? undefined)}
      defaultValue={defaultValue ? toAriaTime(defaultValue) : undefined}
      onChange={
        onChange ? (time) => time && onChange(fromAriaTime(time)) : undefined
      }
      {...props}
      render={(props, { isInvalid, isDisabled }) => (
        <InputGroup
          size={size}
          className={className}
          role="presentation"
          data-disabled={isDisabled || undefined}
        >
          {!!startAddon && (
            <InputGroupAddon align="inline-start">{startAddon}</InputGroupAddon>
          )}
          <DateInput aria-invalid={isInvalid || undefined} {...props} />
          {!!endAddon && (
            <InputGroupAddon align="inline-end">{endAddon}</InputGroupAddon>
          )}
        </InputGroup>
      )}
    />
  );
}

export { DateInput, DateSegment, TimeInput };
export type { TimeInputProps, TimeValue };

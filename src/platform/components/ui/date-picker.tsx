import { CalendarIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { useDisclosure } from 'react-use-disclosure';

import { Calendar } from '@/platform/components/ui/calendar';
import { DateInput } from '@/platform/components/ui/date-input';
import { InputGroupButton } from '@/platform/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/platform/components/ui/popover';

type DatePickerProps = ComponentProps<typeof DateInput> & {
  noCalendar?: boolean;
  calendarProps?: Omit<
    ComponentProps<typeof Calendar>,
    'onSelect' | 'selected' | 'mode'
  >;
};

export const DatePicker = ({
  calendarProps,
  noCalendar = false,
  ...props
}: DatePickerProps) => {
  const datePicker = useDisclosure();

  return (
    <DateInput
      {...props}
      endAddon={
        noCalendar ? null : (
          <Popover
            open={datePicker.isOpen}
            onOpenChange={(open) => datePicker.toggle(open)}
          >
            <PopoverTrigger render={<InputGroupButton size="icon-xs" />}>
              <CalendarIcon />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={props.value ?? undefined}
                onSelect={(date) => {
                  props.onChange?.(date ?? null);
                  datePicker.close();
                }}
                defaultMonth={props.value ?? undefined}
                autoFocus
                {...calendarProps}
              />
            </PopoverContent>
          </Popover>
        )
      }
    />
  );
};

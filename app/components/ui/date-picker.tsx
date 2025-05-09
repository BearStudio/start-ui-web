import { CalendarIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { useDisclosure } from 'react-use-disclosure';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateInput } from '@/components/ui/date-input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
      endElement={
        noCalendar ? null : (
          <Popover
            open={datePicker.isOpen}
            onOpenChange={(open) => datePicker.toggle(open)}
          >
            <PopoverTrigger asChild>
              <Button size="icon-xs" variant="secondary" className="-mr-1.5">
                <CalendarIcon />
              </Button>
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

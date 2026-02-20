import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';
import {
  ChevronProps,
  DayPicker,
  type DayPickerProps,
  labelNext,
  labelPrevious,
  NavProps,
  useDayPicker,
} from 'react-day-picker';
import { enUS } from 'react-day-picker/locale';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { cn } from '@/lib/tailwind/utils';

import { Button, buttonVariants } from '@/components/ui/button';

import { REACT_DAY_PICKER_LOCALE_MAP } from '@/locales/react-day-picker';

const ChevronWrapper = ({ orientation }: ChevronProps) =>
  match(orientation)
    .with('left', () => <ChevronLeft className="size-4" />)
    .with('right', () => <ChevronRight className="size-4" />)
    .with('down', () => <ChevronDown className="size-4" />)
    .with('up', () => <ChevronUp className="size-4" />)
    .with(undefined, () => <ChevronDown className="size-4" />)
    .exhaustive();

/**
 * A custom calendar component built on top of react-day-picker.
 */
export function Calendar({
  className,
  showOutsideDays = true, // by default, we want outside days
  ...props
}: DayPickerProps) {
  const { i18n } = useTranslation();

  const locale = REACT_DAY_PICKER_LOCALE_MAP[i18n?.language] ?? enUS;

  const _monthsClassName = cn('relative flex', props.classNames?.months);
  const _monthCaptionClassName = cn(
    'relative mx-10 flex h-7 items-center justify-center',
    props.classNames?.month_caption
  );
  const _weekdaysClassName = cn('flex flex-row', props.classNames?.weekdays);
  const _weekdayClassName = cn(
    'w-8 text-sm font-normal text-muted-foreground',
    props.classNames?.weekday
  );
  const _monthClassName = cn('w-full', props.classNames?.month);
  const _captionLabelClassName = cn(
    'flex items-center justify-center gap-1 truncate text-sm font-medium',
    props.classNames?.caption_label
  );
  const buttonNavClassName = buttonVariants({
    variant: 'secondary',
    className:
      'absolute h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
  });
  const _buttonNextClassName = cn(
    buttonNavClassName,
    'right-0',
    props.classNames?.button_next
  );
  const _buttonPreviousClassName = cn(
    buttonNavClassName,
    'left-0',
    props.classNames?.button_previous
  );
  const _navClassName = cn('flex items-start', props.classNames?.nav);
  const _monthGridClassName = cn('mx-auto mt-4', props.classNames?.month_grid);
  const _weekClassName = cn(
    'mt-2 flex w-max items-start',
    props.classNames?.week
  );
  const _dayClassName = cn(
    'flex size-8 flex-1 items-center justify-center p-0 text-sm',
    props.classNames?.day
  );
  const _dayButtonClassName = cn(
    buttonVariants({ variant: 'ghost' }),
    'size-8 rounded-md p-0 font-normal transition-none aria-selected:opacity-100',
    props.classNames?.day_button
  );
  const buttonRangeClassName =
    'bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground';
  const _rangeStartClassName = cn(
    buttonRangeClassName,
    'day-range-start rounded-s-md',
    props.classNames?.range_start
  );
  const _rangeEndClassName = cn(
    buttonRangeClassName,
    'day-range-end rounded-e-md',
    props.classNames?.range_end
  );
  const _rangeMiddleClassName = cn(
    'bg-accent text-foreground! [&>button]:bg-transparent [&>button]:text-foreground! [&>button]:hover:bg-transparent [&>button]:hover:text-foreground!',
    props.classNames?.range_middle
  );
  const _selectedClassName = cn(
    '[&>button]:bg-primary [&>button]:font-medium [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground',
    props.classNames?.selected
  );
  const _todayClassName = cn(
    '[&>button]:bg-accent [&>button]:text-accent-foreground',
    props.classNames?.today
  );
  const _outsideClassName = cn(
    'day-outside text-muted-foreground opacity-80 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
    props.classNames?.outside
  );
  const _disabledClassName = cn(
    'text-muted-foreground opacity-60',
    props.classNames?.disabled
  );
  const _hiddenClassName = cn('invisible flex-1', props.classNames?.hidden);

  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      style={{
        width: 248.8 * (props.numberOfMonths ?? 1) + 'px',
      }}
      classNames={{
        months: _monthsClassName,
        month_caption: _monthCaptionClassName,
        weekdays: _weekdaysClassName,
        weekday: _weekdayClassName,
        month: _monthClassName,
        caption_label: _captionLabelClassName,
        button_next: _buttonNextClassName,
        button_previous: _buttonPreviousClassName,
        nav: _navClassName,
        month_grid: _monthGridClassName,
        week: _weekClassName,
        day: _dayClassName,
        day_button: _dayButtonClassName,
        range_start: _rangeStartClassName,
        range_middle: _rangeMiddleClassName,
        range_end: _rangeEndClassName,
        selected: _selectedClassName,
        today: _todayClassName,
        outside: _outsideClassName,
        disabled: _disabledClassName,
        hidden: _hiddenClassName,

        dropdowns: cn(
          'flex flex-1 justify-between [&>span]:flex',
          props.classNames?.dropdowns
        ),
        dropdown: cn(
          'cursor-inherit leading-inherit absolute inset-0 m-0 w-full appearance-none border-none p-0 opacity-0',
          props.classNames?.dropdown
        ),
        dropdown_root: cn('relative', props.classNames?.dropdown_root),
      }}
      components={{
        Chevron: ChevronWrapper,
        Nav,
      }}
      {...props}
    />
  );
}

function Nav({ className }: NavProps) {
  const {
    nextMonth,
    previousMonth,
    goToMonth,
    dayPickerProps: { onPrevClick, onNextClick },
  } = useDayPicker();

  const isPreviousDisabled = !previousMonth;

  const isNextDisabled = !nextMonth;

  const handlePreviousClick = () => {
    if (!previousMonth) return;

    goToMonth(previousMonth);
    onPrevClick?.(previousMonth);
  };

  const handleNextClick = () => {
    if (!nextMonth) return;

    goToMonth(nextMonth);
    onNextClick?.(nextMonth);
  };

  return (
    <nav className={cn('flex items-center', className)}>
      <Button
        variant="secondary"
        className="absolute left-0 h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
        tabIndex={isPreviousDisabled ? undefined : -1}
        disabled={isPreviousDisabled}
        aria-label={labelPrevious(previousMonth)}
        onClick={handlePreviousClick}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        className="absolute right-0 h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
        tabIndex={isNextDisabled ? undefined : -1}
        disabled={isNextDisabled}
        aria-label={labelNext(nextMonth)}
        onClick={handleNextClick}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

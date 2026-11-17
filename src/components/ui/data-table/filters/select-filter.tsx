import type * as React from 'react';

import type { DataTableFilter } from '@/components/ui/data-table/filters/filter';
import {
  ClearOptionsItem,
  type DataTableFilterOption,
  type DataTableOptionsStatus,
  labelOf,
  OptionCount,
  OptionsAnnouncement,
  OptionsStatusItems,
  UnknownValue,
} from '@/components/ui/data-table/filters/options';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** A filter that holds one of its options. It reads any text: the URL may hold a value the options lack. */
export const selectFilter = <const Value extends string>({
  title,
  options,
  placeholder,
  ...status
}: {
  title: string;
  options: ReadonlyArray<DataTableFilterOption<Value>>;
  placeholder?: string;
} & DataTableOptionsStatus): DataTableFilter<string, Value> => ({
  title,
  placeholder,
  summary: (value): React.ReactNode =>
    labelOf(options, value) ?? (
      <UnknownValue value={value} status={status} count={options.length} />
    ),
  editor: ({ trigger, value, onValueChange, open, onOpenChange }) => (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger {...trigger} />
        <DropdownMenuContent className="w-auto min-w-32">
          <OptionsStatusItems status={status} count={options.length} />
          <DropdownMenuRadioGroup
            value={value ?? null}
            onValueChange={(next: Value) => onValueChange(next)}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem
                indicator="end"
                key={option.value}
                value={option.value}
                closeOnClick
              >
                {option.label}
                <OptionCount count={option.count} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {value !== undefined && (
            <ClearOptionsItem onClear={() => onValueChange(undefined)} />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <OptionsAnnouncement status={status} count={options.length} open={open} />
    </>
  ),
});

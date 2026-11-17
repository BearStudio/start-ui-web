import type * as React from 'react';
import { useTranslation } from 'react-i18next';

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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const namedLabels = 2;

function SelectedCount({ count }: { count: number }) {
  const { t } = useTranslation(['components']);
  return t('components:dataTable.selectedCount', { count });
}

/**
 * A filter that holds any number of its options, in the order of the options. A value the options do not hold
 * stays, after the others and ticked in the menu, until it is unticked or cleared.
 */
export const multiSelectFilter = <const Value extends string>({
  title,
  options,
  placeholder,
  ...status
}: {
  title: string;
  options: ReadonlyArray<DataTableFilterOption<Value>>;
  placeholder?: string;
} & DataTableOptionsStatus): DataTableFilter<
  ReadonlyArray<string>,
  Value[]
> => {
  const known = new Set<string>(options.map((option) => option.value));
  // Once each, though the URL may repeat them.
  const unknownOf = (values: ReadonlyArray<string>) => [
    ...new Set(values.filter((value) => !known.has(value))),
  ];
  // A value the options lack came from the field, so it is one of the field's values.
  const ordered = (values: ReadonlyArray<string>) =>
    [
      ...options
        .map((option) => option.value)
        .filter((value) => values.includes(value)),
      ...unknownOf(values),
    ] as Value[];

  return {
    title,
    placeholder,
    summary: (values): React.ReactNode => {
      const shown = ordered(values);
      if (shown.length > namedLabels)
        return <SelectedCount count={shown.length} />;
      return shown.map((value, index) => (
        <span key={value}>
          {index > 0 && ', '}
          {labelOf(options, value) ?? (
            <UnknownValue
              value={value}
              status={status}
              count={options.length}
            />
          )}
        </span>
      ));
    },
    editor: ({ trigger, value = [], onValueChange, open, onOpenChange }) => {
      // From the value as it is once earlier ticks land, not as this render saw it: quick ticks all count.
      const toggle = (toggled: string, checked: boolean) =>
        onValueChange((current = []) =>
          ordered(
            checked
              ? [...current, toggled]
              : current.filter((other) => other !== toggled)
          )
        );
      return (
        <>
          <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger {...trigger} />
            <DropdownMenuContent className="w-auto min-w-36">
              <OptionsStatusItems status={status} count={options.length} />
              {options.map((option) => (
                <DropdownMenuCheckboxItem
                  indicator="checkbox"
                  key={option.value}
                  checked={value.includes(option.value)}
                  onCheckedChange={(checked) => toggle(option.value, checked)}
                >
                  {option.label}
                  <OptionCount count={option.count} />
                </DropdownMenuCheckboxItem>
              ))}
              {unknownOf(value).map((unknown) => (
                <DropdownMenuCheckboxItem
                  indicator="checkbox"
                  key={unknown}
                  checked
                  onCheckedChange={(checked) => toggle(unknown, checked)}
                >
                  <UnknownValue
                    value={unknown}
                    status={status}
                    count={options.length}
                  />
                </DropdownMenuCheckboxItem>
              ))}
              {value.length > 0 && (
                <ClearOptionsItem onClear={() => onValueChange([])} />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <OptionsAnnouncement
            status={status}
            count={options.length}
            open={open}
          />
        </>
      );
    },
  };
};

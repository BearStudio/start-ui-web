import type { RowData } from '@tanstack/react-table';
import { Columns3Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import type { DataTableColumn } from '@/components/ui/data-table/data-table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Toggle = { readonly id: string; readonly title: string };

// A column with no `title` has no name to list it by: it always shows.
const togglesOf = (
  columns: ReadonlyArray<DataTableColumn<RowData>>,
  group?: string
): ReadonlyArray<Toggle> =>
  columns.flatMap((column): ReadonlyArray<Toggle> => {
    if (column.columns !== undefined)
      // Named by its whole path, nested groups included: two columns of one name in two groups stay apart.
      return togglesOf(
        column.columns,
        group === undefined ? column.title : `${group} · ${column.title}`
      );
    if (column.title === undefined || column.id === undefined) return [];
    return [
      {
        id: column.id,
        title:
          group === undefined ? column.title : `${group} · ${column.title}`,
      },
    ];
  });

/**
 * A menu that shows or hides the columns of a table, each named by its `title` (a group's prefixed to its columns').
 * The last column shown cannot be hidden.
 */
export function DataTableColumnVisibility<TData extends RowData>({
  table,
  columns,
}: {
  table: {
    readonly hiddenColumns: ReadonlyArray<string>;
    readonly setColumnVisible: (id: string, visible: boolean) => void;
  };
  columns: ReadonlyArray<DataTableColumn<TData>>;
}) {
  const { t } = useTranslation(['components']);
  const toggles = togglesOf(columns as ReadonlyArray<DataTableColumn<RowData>>);
  // A URL that hides every column hides none, as the table shows it.
  const hidden = toggles.every((toggle) =>
    table.hiddenColumns.includes(toggle.id)
  )
    ? []
    : table.hiddenColumns;
  const shown = toggles.filter((toggle) => !hidden.includes(toggle.id));
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>
        <Columns3Icon />
        {t('components:dataTable.columns')}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {t('components:dataTable.columnsShown')}
          </DropdownMenuLabel>
          {toggles.map((toggle) => {
            const checked = !hidden.includes(toggle.id);
            return (
              <DropdownMenuCheckboxItem
                indicator="checkbox"
                key={toggle.id}
                checked={checked}
                disabled={checked && shown.length === 1}
                onCheckedChange={(next) => {
                  // From every column hidden in the URL, hiding one shows the others.
                  if (hidden !== table.hiddenColumns)
                    for (const other of toggles)
                      if (other.id !== toggle.id)
                        table.setColumnVisible(other.id, true);
                  table.setColumnVisible(toggle.id, next);
                }}
              >
                {toggle.title}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

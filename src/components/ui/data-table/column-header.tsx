import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  ListFilterIcon,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import type { SortDirection } from '@/components/ui/data-table/state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const sortIcons = { asc: ArrowUpIcon, desc: ArrowDownIcon } as const;

/**
 * The header of a column: a menu that sorts it, and filters it too when it has a filter. A column that only filters
 * is a button that opens its filter. `align="end"` sets it at the end of the cell, over a column of numbers.
 */
export function DataTableColumnHeader({
  title,
  sorted,
  onSort,
  onFilter,
  align = 'start',
}: { title: string; align?: 'start' | 'end' } & (
  | {
      sorted: SortDirection | undefined;
      onSort: (direction: SortDirection) => void;
      /** Called once the menu has closed, so the filter it shows can take the focus. */
      onFilter?: () => void;
    }
  | { sorted?: undefined; onSort?: undefined; onFilter: () => void }
)) {
  const { t } = useTranslation(['components']);
  // Read when the menu closes: the filter takes the focus, not the header.
  const filtering = React.useRef(false);
  // The ghost button's padding is pulled back, so its label lines up with the cells under it.
  const edge = align === 'end' ? '-me-2.5' : '-ms-2.5';
  const hintId = React.useId();

  if (onSort === undefined)
    return (
      // Named by its title alone, as the column it heads: what it does is its description.
      <Button
        data-slot="data-table-column-header"
        variant="ghost"
        size="sm"
        className={edge}
        aria-describedby={hintId}
        onClick={onFilter}
      >
        {align === 'end' && (
          <ListFilterIcon className="text-muted-foreground" />
        )}
        {title}
        {align !== 'end' && (
          <ListFilterIcon className="text-muted-foreground" />
        )}
        <span id={hintId} hidden>
          {t('components:dataTable.filter')}
        </span>
      </Button>
    );

  const HeaderIcon =
    sorted === undefined ? ChevronsUpDownIcon : sortIcons[sorted];
  const icon = (
    <HeaderIcon
      className={cn(sorted === undefined && 'text-muted-foreground')}
    />
  );

  return (
    <DropdownMenu
      onOpenChange={(next) => {
        if (next) filtering.current = false;
      }}
      onOpenChangeComplete={(next) => {
        if (next || !filtering.current) return;
        filtering.current = false;
        onFilter?.();
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            data-slot="data-table-column-header"
            variant="ghost"
            size="sm"
            className={edge}
          />
        }
      >
        {/* Over a column of numbers, the icon comes first: the title then lines up with the figures. */}
        {align === 'end' && icon}
        {title}
        {align !== 'end' && icon}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-auto min-w-36"
        finalFocus={() => !filtering.current}
      >
        <DropdownMenuRadioGroup
          value={sorted ?? null}
          onValueChange={(direction: SortDirection) => onSort(direction)}
        >
          <DropdownMenuRadioItem indicator="end" value="asc" closeOnClick>
            <ArrowUpIcon className="text-muted-foreground" />
            {t('components:dataTable.sortAscending')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem indicator="end" value="desc" closeOnClick>
            <ArrowDownIcon className="text-muted-foreground" />
            {t('components:dataTable.sortDescending')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        {onFilter !== undefined && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                filtering.current = true;
              }}
            >
              <ListFilterIcon className="text-muted-foreground" />
              {t('components:dataTable.filter')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { PlusIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** Renders nothing once every filter is shown. */
export function DataTableAddFilter<Key extends string>({
  filters,
  onAdd,
  ref,
}: {
  filters: ReadonlyArray<{ readonly key: Key; readonly title: string }>;
  /** Called once the menu has closed, so the filter it adds can take the focus. */
  onAdd: (key: Key) => void;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  const { t } = useTranslation(['components']);
  // Read when the menu closes: the filter added takes the focus, not this button.
  const chosen = React.useRef<Key | null>(null);

  if (filters.length === 0) return null;

  return (
    <DropdownMenu
      onOpenChange={(next) => {
        if (next) chosen.current = null;
      }}
      onOpenChangeComplete={(next) => {
        const key = chosen.current;
        if (next || key === null) return;
        chosen.current = null;
        onAdd(key);
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            ref={ref}
            data-slot="data-table-add-filter"
            variant="ghost"
            size="sm"
          />
        }
      >
        <PlusIcon />
        {t('components:dataTable.addFilter')}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-auto min-w-36"
        finalFocus={() => chosen.current === null}
      >
        {filters.map(({ key, title }) => (
          <DropdownMenuItem
            key={key}
            onClick={() => {
              chosen.current = key;
            }}
          >
            {title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

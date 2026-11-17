import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

/** Scrolls a table wider than its parent. A table in a `ScrollArea`, as `DataTable` is, goes without it. */
function TableContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="table-container"
      className={cn('relative w-full overflow-x-auto', className)}
      {...props}
    />
  );
}

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <table
      data-slot="table"
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  );
}

const tableHeaderVariants = cva('', {
  variants: {
    sticky: {
      // A border stays behind a sticky row: each cell draws its own line, and its own background over the rows.
      false: '[&_tr]:border-b',
      true: 'sticky top-0 z-10 [&_th]:bg-surface [&_th]:inset-shadow-edge-b [&_tr]:border-b-0',
    },
  },
  defaultVariants: { sticky: false },
});

function TableHeader({
  className,
  sticky,
  ...props
}: React.ComponentProps<'thead'> & VariantProps<typeof tableHeaderVariants>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(tableHeaderVariants({ sticky }), className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      // Busy while other rows load: the rows shown fade, as stale.
      className={cn(
        'transition-opacity aria-busy:opacity-60 motion-reduce:transition-none [&_tr:last-child]:border-0',
        className
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  );
}

const tableRowVariants = cva(
  'group/row border-b transition-colors data-[state=selected]:bg-row-selected motion-reduce:transition-none',
  {
    variants: {
      /** `false` for a row that holds no data, such as an empty or loading state: it does not light up. */
      hoverable: {
        true: 'not-data-[state=selected]:hover:bg-row-hover not-data-[state=selected]:has-aria-expanded:bg-row-hover data-[state=selected]:hover:bg-row-selected-hover',
        false: '',
      },
      interactive: {
        false: '',
        // A row that opens something: it takes the focus, and shows it.
        true: 'cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset not-data-[state=selected]:focus-visible:bg-row-hover',
      },
    },
    defaultVariants: { hoverable: true, interactive: false },
  }
);

function TableRow({
  className,
  hoverable,
  interactive,
  ...props
}: React.ComponentProps<'tr'> & VariantProps<typeof tableRowVariants>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(tableRowVariants({ hoverable, interactive }), className)}
      {...props}
    />
  );
}

// A cell that stays at the end of its row while the others scroll under it: opaque, with the background its row
// would show through it. Inside a scroll area named `group/scroll` (`DataTable`'s), it draws its edge only while
// columns hide under it, on the side they come from.
const stickyEnd =
  'sticky end-0 z-1 w-px bg-surface ltr:group-data-overflow-x-end/scroll:shadow-edge-l rtl:group-data-overflow-x-end/scroll:shadow-edge-r';

// A cell pinned at the start of its row, at `--pin-start` from it (the width of the cells pinned before it).
const stickyStart = 'sticky start-(--pin-start) z-1 bg-surface';

// The backgrounds a row shows through a cell, for an opaque one.
const rowBackgrounds =
  'group-hover/row:bg-row-hover group-focus-visible/row:bg-row-hover group-has-aria-expanded/row:bg-row-hover group-data-[state=selected]/row:bg-row-selected! group-data-[state=selected]/row:group-hover/row:bg-row-selected-hover!';

// The last cell pinned at the start draws its edge while columns hide under it.
const pinEdge =
  'ltr:group-data-overflow-x-start/scroll:shadow-edge-r rtl:group-data-overflow-x-start/scroll:shadow-edge-l';

const tableHeadVariants = cva(
  'h-10 px-3 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0',
  {
    variants: {
      sticky: { false: '', start: stickyStart, end: stickyEnd },
      /** The last of the cells pinned at the start: it draws the edge the others scroll under. */
      pinEdge: { false: '', true: pinEdge },
      /** As narrow as its content: a checkbox, the actions of a row. */
      shrink: { false: '', true: 'w-px' },
      align: { start: '', end: 'text-end', center: 'text-center' },
      /** The header of a group of columns, centered over them. */
      spans: { false: '', true: 'text-center' },
    },
    defaultVariants: {
      sticky: false,
      pinEdge: false,
      shrink: false,
      align: 'start',
      spans: false,
    },
  }
);

function TableHead({
  className,
  sticky,
  pinEdge,
  shrink,
  align,
  spans,
  ...props
}: Omit<React.ComponentProps<'th'>, 'align'> &
  VariantProps<typeof tableHeadVariants>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        tableHeadVariants({ sticky, pinEdge, shrink, align, spans }),
        className
      )}
      {...props}
    />
  );
}

const tableCellVariants = cva(
  'px-3 py-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0',
  {
    variants: {
      sticky: {
        false: '',
        start: `${stickyStart} ${rowBackgrounds}`,
        end: `${stickyEnd} ${rowBackgrounds}`,
      },
      pinEdge: { false: '', true: pinEdge },
      shrink: { false: '', true: 'w-px' },
      align: { start: '', end: 'text-end tabular-nums', center: 'text-center' },
      /** `true` for prose: the text wraps rather than widening the column. */
      wrap: { false: '', true: 'whitespace-normal' },
      tone: { default: '', muted: 'text-muted-foreground' },
    },
    defaultVariants: {
      sticky: false,
      pinEdge: false,
      shrink: false,
      align: 'start',
      wrap: false,
      tone: 'default',
    },
  }
);

function TableCell({
  className,
  sticky,
  pinEdge,
  shrink,
  align,
  wrap,
  tone,
  ...props
}: Omit<React.ComponentProps<'td'>, 'align'> &
  VariantProps<typeof tableCellVariants>) {
  return (
    <td
      data-slot="table-cell"
      data-sticky={sticky || undefined}
      className={cn(
        tableCellVariants({ sticky, pinEdge, shrink, align, wrap, tone }),
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};

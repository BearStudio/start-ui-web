import type { Meta } from '@storybook/react-vite';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default {
  title: 'Table',
} satisfies Meta<typeof Table>;

const invoices = [
  { id: 'INV-001', status: 'Paid', method: 'Card', amount: 250 },
  { id: 'INV-002', status: 'Pending', method: 'Transfer', amount: 150 },
  { id: 'INV-003', status: 'Unpaid', method: 'Card', amount: 350 },
  { id: 'INV-004', status: 'Paid', method: 'Cash', amount: 450 },
];

const amount = (value: number) =>
  new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' }).format(
    value
  );

// A static table: for one that sorts, filters, pages or selects, see DataTable.
export const Default = () => {
  return (
    <TableContainer>
      <Table>
        <TableCaption>Invoices of the month</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead align="end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.id}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell align="end">{amount(invoice.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell align="end">
              {amount(invoices.reduce((sum, { amount }) => sum + amount, 0))}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export const StickyHeader = () => {
  return (
    <TableContainer className="h-48 overflow-y-auto rounded-lg border">
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...invoices, ...invoices, ...invoices].map((invoice, index) => (
            <TableRow key={`${invoice.id}-${index}`}>
              <TableCell>{invoice.id}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell align="end">{amount(invoice.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

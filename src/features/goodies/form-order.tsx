import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsGoodieOrder } from '@/features/goodies/schema';

const ORDER_TYPE_OPTIONS = [
  { id: 'IDEA', label: 'Idea' },
  { id: 'REQUESTED', label: 'Requested' },
  { id: 'QUOTED', label: 'Quoted' },
  { id: 'ORDERED', label: 'Ordered' },
  { id: 'RECEIVED', label: 'Received' },
  { id: 'CANCELLED', label: 'Cancelled' },
] as const;

export const FormGoodieOrder = () => {
  const form = useFormContext<FormFieldsGoodieOrder>();

  // Fetch de tous les fournisseurs
  const { data: suppliers = [] } = useQuery({
    queryKey: orpc.supplier.getAllSuppliers.key(),
    queryFn: () => orpc.supplier.getAllSuppliers.call(),
  });

  // Fetch de tous les Users
  const { data: users = [] } = useQuery({
    queryKey: orpc.user.getAll.key(),
    queryFn: () => orpc.user.getAll.call(),
  });

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Goodie à commander</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>

      <FormField>
        <FormFieldLabel>Fournisseur</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          name="supplierId"
          options={suppliers.map((supplier) => ({
            id: supplier.id,
            label: supplier.name,
          }))}
        />
      </FormField>

      <FormField>
        <FormFieldLabel>Quantité</FormFieldLabel>
        <FormFieldController
          type="number"
          control={form.control}
          name="quantity"
        />
      </FormField>

      <FormField>
        <FormFieldLabel>Qui s'en occupe ?</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          name="madeById"
          options={
            users?.items
              ? users.items.map((user) => ({ id: user.id, label: user.name }))
              : []
          }
        />
      </FormField>

      <FormField>
        <FormFieldLabel>Status</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          name="status"
          options={ORDER_TYPE_OPTIONS}
        />
      </FormField>
    </div>
  );
};

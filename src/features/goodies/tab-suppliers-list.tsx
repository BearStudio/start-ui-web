import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { FormFieldsSupplier } from '@/features/goodies/schema';

import CardSupplier from './components/card-supplier';
import { FormSupplier } from './form-supplier';
import { Building2 } from 'lucide-react';

export default function GoodieSuppliersTab() {
  const queryClient = useQueryClient();

  const form = useForm<FormFieldsSupplier>({
    defaultValues: {
      name: '',
      websiteUrl: '',
      contact: '',
      comment: null,
    },
  });

  // Fetch de tous les fournisseurs
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: orpc.supplier.getAllSuppliers.key(),
    queryFn: () => orpc.supplier.getAllSuppliers.call(),
  });

  // Création d'un fournisseur
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await orpc.supplier.createSupplier.call(values);

      await queryClient.invalidateQueries({
        queryKey: orpc.supplier.getAllSuppliers.key(),
      });

      form.reset({
        ...form.getValues(),
        name: '',
      });

      toast.success('Fournisseur ajoutée');
    } catch {
      toast.error('Erreur lors de la création');
    }
  });

  // Supression d'un fournisseur
  async function deleteSupplier(id: string) {
    try {
      await orpc.supplier.deletSupplierById.call({ id });

      await queryClient.invalidateQueries({
        queryKey: orpc.supplier.getAllSuppliers.key(),
      });

      toast.success('Fournisseur supprimé');
    } catch (err) {
      console.error('Erreur lors de la suppression du fournisseur', err);
    }
  }

  if (isLoading) {
    return <div>Chargement des fournisseurs...</div>;
  }

  return (
    <div className="space-y-6">
      <FormProvider {...form}>
        {/*ADD SUPPLIER*/}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Building2 />
              Nouveau fournisseur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <FormSupplier />
            <Button onClick={onSubmit}>Ajouter</Button>
          </CardContent>
        </Card>

        {/*SUPPLIER LIST*/}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <CardSupplier
              key={supplier.id}
              name={supplier.name}
              websiteUrl={supplier.websiteUrl ?? ''}
              contact={supplier.contact ?? ''}
              comment={supplier.comment ?? ''}
              onDelete={() => deleteSupplier(supplier.id)}
            />
          ))}
        </div>
      </FormProvider>
    </div>
  );
}

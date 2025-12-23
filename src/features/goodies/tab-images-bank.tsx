import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ImageIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { FormImage } from '@/features/goodies/form-image';
import { FormFieldsAsset } from '@/features/goodies/schema';

export default function GoodieAssetsTab() {
  const [zoomed, setZoomed] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<FormFieldsAsset>({
    defaultValues: {
      name: '',
      type: 'LOGO',
      url: '',
      comment: null,
      supplierId: null,
    },
  });

  // Fetch de tous les assets
  const { data: assets = [], isLoading } = useQuery({
    queryKey: orpc.asset.getAllAssets.key(),
    queryFn: () => orpc.asset.getAllAssets.call(),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await orpc.asset.createAsset.call(values);

      await queryClient.invalidateQueries({
        queryKey: orpc.asset.getAllAssets.key(),
      });

      form.reset({
        ...form.getValues(),
        name: '',
        url: '',
      });

      toast.success('Image ajoutée');
    } catch {
      toast.error('Erreur lors de la création');
    }
  });

  if (isLoading) {
    return <div>Chargement des assets...</div>;
  }

  return (
    <div className="space-y-6">
      <FormProvider {...form}>
        {/* ADD IMAGE CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <ImageIcon />
              Ajouter une image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <FormImage />
            <Button onClick={onSubmit}>Ajouter</Button>
          </CardContent>
        </Card>

        {/* IMAGES GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card
              key={asset.id}
              className="relative overflow-hidden rounded-2xl"
            >
              <img
                src={asset.url}
                alt={asset.name}
                className="bg-gray-100 h-48 w-full cursor-pointer object-contain"
                onClick={() => setZoomed(asset.url)}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => console.log('download')}
                >
                  <Download size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await orpc.asset.deletAssetById.call({ id: asset.id });
                      await queryClient.invalidateQueries({
                        queryKey: orpc.asset.getAllAssets.key(),
                      });
                      toast.success('Asset supprimé');
                    } catch {
                      toast.error('Erreur lors de la suppression');
                    }
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="font-medium">{asset.name}</div>
                <div className="text-sm text-muted-foreground">
                  {asset.type} •{' '}
                  {new Date(asset.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ZOOM DIALOG */}
        <Dialog open={!!zoomed} onOpenChange={() => setZoomed(null)}>
          <DialogContent className="flex max-h-[90vh] max-w-[90vw] items-center justify-center overflow-auto p-4">
            {zoomed && (
              <img
                src={zoomed}
                alt="Zoomed"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      </FormProvider>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { PlusIcon, X } from 'lucide-react';
import { useEffect } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';

import {
  FormFieldsGoodie,
  mapFormToApi,
  SIZE_OPTIONS,
} from '@/features/goodies/page-goodies-new';
import { zGoodieCategory } from '@/features/goodies/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

const GOODIE_CATEGORY_OPTIONS = zGoodieCategory.options.map((c) => ({
  id: c,
  value: c,
  label: c.toLowerCase(),
}));

export default function PageGoodieEdit(props: { params: { id: string } }) {
  const form = useForm<FormFieldsGoodie>({
    defaultValues: {
      name: '',
      edition: '',
      category: 'OTHER',
      description: '',
      photoUrl: null,
      variantMode: 'none',
      variants: [],
      totalQuantity: 0,
      releaseDate: '',
    },
  });
  const { control, watch, handleSubmit, reset } = form;

  const goodieQuery = useQuery(
    orpc.goodie.getGoodieById.queryOptions({ input: { id: props.params.id } })
  );
  useEffect(() => {
    if (!goodieQuery.data) return;

    const g = goodieQuery.data;

    // Déterminer le mode de variante à partir des données existantes
    let mode: FormFieldsGoodie['variantMode'] = 'none';
    if (g.variants?.length > 0) {
      const hasSize = g.variants.some((v) => !!v.size);
      const hasColor = g.variants.some((v) => !!v.color);
      if (hasSize && hasColor) mode = 'sizeAndColor';
      else if (hasSize) mode = 'size';
      else if (hasColor) mode = 'color';
    }

    reset({
      name: g.name,
      edition: g.edition ?? '',
      category: g.category ?? 'OTHER',
      description: g.description ?? '',
      photoUrl: g.photoUrl ?? null,
      releaseDate: g.releaseDate
        ? new Date(g.releaseDate).toISOString().slice(0, 10)
        : '',
      variantMode: mode,
      variants:
        g.variants?.map((v) => ({
          size: v.size ?? '',
          color: v.color ?? '',
          quantity: v.stockQty ?? 0,
        })) ?? [],
      totalQuantity: g.total ?? 0,
    });
  }, [goodieQuery.data, reset]);

  const variantMode = watch('variantMode');
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  useEffect(() => {
    // Vider le tableau si mode 'none'
    if (variantMode === 'none' && fields.length > 0) {
      fields.forEach((_, index) => remove(index));
      return;
    }

    // Ajouter des lignes si le tableau est vide
    if (fields.length === 0) {
      if (variantMode === 'size') {
        ['S', 'M', 'L'].forEach((size) => append({ size, quantity: 0 }));
      } else if (variantMode === 'color') {
        ['Rouge', 'Bleu', 'Vert'].forEach((color) =>
          append({ color, quantity: 0 })
        );
      } else if (variantMode === 'sizeAndColor') {
        ['S', 'M', 'L'].forEach((size) =>
          append({ size, color: '', quantity: 0 })
        );
      }
    }
  }, [variantMode]);

  const queryClient = useQueryClient();
  const canGoBack = useCanGoBack();
  const router = useRouter();

  const goodieUpdate = useMutation(
    orpc.goodie.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.book.getAll.key(),
          type: 'all',
        });

        if (canGoBack) {
          router.history.back({ ignoreBlocker: true });
        } else {
          router.navigate({ to: '..', replace: true, ignoreBlocker: true });
        }
      },
      onError: (e) => {
        toast(e.message);
      },
    })
  );

  return (
    <PageLayout>
      <FormProvider {...form}>
        <form
          id="goodie-edit-form"
          onSubmit={handleSubmit((values) => {
            const payload = mapFormToApi(values);
            goodieUpdate.mutate({ id: props.params.id, data: payload });
          })}
          className="flex flex-1 flex-col"
        >
          <PageLayoutTopBar
            backButton={<BackButton />}
            actions={
              <Button type="submit" form="goodie-edit-form">
                Mettre à jour
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              <div className="flex flex-row items-center gap-4">
                <span>Modification d'un goodie</span>
              </div>
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <div className="flex flex-1">
            <PageLayoutContent className="flex flex-1">
              <div className="container mx-auto p-4">
                <h1 className="mb-4 text-2xl font-bold">Modifier un goodie</h1>

                <div className="flex flex-col gap-3">
                  <FormField>
                    <FormFieldLabel>Nom du goodie *</FormFieldLabel>
                    <FormFieldController
                      control={control}
                      name="name"
                      type="text"
                      autoFocus
                    />
                  </FormField>

                  <FormField>
                    <FormFieldLabel>Edition / Année</FormFieldLabel>
                    <FormFieldController
                      control={control}
                      name="edition"
                      type="text"
                    />
                  </FormField>

                  <FormField>
                    <FormFieldLabel>Catégorie *</FormFieldLabel>
                    <FormFieldController
                      type="select"
                      control={control}
                      name="category"
                      placeholder="Type de goodie"
                      options={GOODIE_CATEGORY_OPTIONS}
                    />
                  </FormField>

                  <FormField>
                    <FormFieldLabel>Description</FormFieldLabel>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <textarea
                          className="w-full rounded border p-2"
                          {...field}
                          placeholder="Description"
                        />
                      )}
                    />
                  </FormField>

                  <FormField>
                    <FormFieldLabel>URL de la photo</FormFieldLabel>
                    <FormFieldController
                      control={control}
                      name="photoUrl"
                      type="text"
                    />
                  </FormField>

                  <FormField>
                    <FormFieldLabel>Type de variante</FormFieldLabel>
                    <FormFieldController
                      control={control}
                      name="variantMode"
                      type="select"
                      options={[
                        { id: 'none', label: 'Aucune' },
                        { id: 'size', label: 'Taille uniquement' },
                        { id: 'color', label: 'Couleur uniquement' },
                        { id: 'sizeAndColor', label: 'Taille et Couleur' },
                      ]}
                    />
                  </FormField>

                  {fields.length > 0 && (
                    <div className="flex flex-col gap-2 rounded border p-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                          {(variantMode === 'size' ||
                            variantMode === 'sizeAndColor') && (
                            <FormField>
                              <FormFieldLabel>Taille</FormFieldLabel>
                              <FormFieldController
                                control={control}
                                name={`variants.${index}.size`}
                                type="select"
                                placeholder="Taille"
                                options={SIZE_OPTIONS}
                              />
                            </FormField>
                          )}
                          {(variantMode === 'color' ||
                            variantMode === 'sizeAndColor') && (
                            <FormField>
                              <FormFieldLabel>Couleur</FormFieldLabel>
                              <FormFieldController
                                control={control}
                                name={`variants.${index}.color`}
                                type="text"
                                placeholder="Couleur"
                              />
                            </FormField>
                          )}
                          <FormField>
                            <FormFieldLabel>Quantité</FormFieldLabel>
                            <FormFieldController
                              control={control}
                              name={`variants.${index}.quantity`}
                              type="number"
                              placeholder="Quantité"
                            />{' '}
                          </FormField>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => remove(index)}
                          >
                            <X />
                          </Button>
                        </div>
                      ))}

                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          Total:{' '}
                          {fields.reduce(
                            (acc, _, i) =>
                              acc + (watch(`variants.${i}.quantity`) || 0),
                            0
                          )}
                        </div>
                        <Button
                          onClick={() =>
                            append({ size: '', color: '', quantity: 0 })
                          }
                        >
                          <PlusIcon />
                          <span>Ajouter une ligne</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {variantMode === 'none' && (
                    <FormField>
                      <FormFieldLabel>Quantité totale</FormFieldLabel>
                      <FormFieldController
                        control={control}
                        name="totalQuantity"
                        type="number"
                        placeholder="Quantité totale"
                      />
                    </FormField>
                  )}
                </div>
              </div>
            </PageLayoutContent>
          </div>
        </form>
      </FormProvider>
    </PageLayout>
  );
}

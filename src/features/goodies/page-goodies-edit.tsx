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
import z from 'zod';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';

import { zFormFieldsGoodie } from '@/features/goodies/schema';
import { zGoodieCategory } from '@/features/goodies/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

type VariantLine = {
  size: string;
  quantity: number;
};

export type FormFieldsGoodie = {
  name: string;
  edition?: string;
  category?: string | null;
  description?: string;
  photoUrl?: string | null;
  hasVariants: boolean;
  variants: VariantLine[];
  totalQuantity: number;
  releaseDate?: string;
};

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
      hasVariants: false,
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
    if (goodieQuery.data) {
      const g = goodieQuery.data;
      reset({
        name: g.name,
        edition: g.edition ?? '',
        category: g.category ?? 'OTHER',
        description: g.description ?? '',
        photoUrl: g.photoUrl ?? null,
        releaseDate: g.releaseDate
          ? new Date(g.releaseDate).toISOString().slice(0, 10)
          : '',
        hasVariants: (g.variants?.length ?? 0) > 0,
        variants:
          g.variants?.map((v) => ({
            size: v.size ?? '',
            quantity: v.stockQty ?? 0,
          })) ?? [],
        totalQuantity: g.total ?? 0,
      });
    }
  }, [goodieQuery.data, reset]);

  const hasVariants = watch('hasVariants');
  useEffect(() => {
    if (hasVariants && fields.length === 0) {
      ['S', 'M', 'L'].forEach((size) => append({ size, quantity: 0 }));
    }

    if (!hasVariants && fields.length > 0) {
      fields.forEach((_, index) => remove(index));
    }
  }, [hasVariants]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

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

  const variants = watch('variants');

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

                  <label className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name="hasVariants"
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="form-checkbox"
                        />
                      )}
                    />
                    Ce goodie a des tailles
                  </label>

                  {hasVariants ? (
                    <div className="flex flex-col gap-2 rounded border p-2">
                      {fields.map((field, index) => {
                        const selectedSizes = variants
                          ?.map((v, i) => (i !== index ? v?.size : null))
                          .filter(Boolean);

                        const sizeOptions = [
                          { id: '2XS', label: '2XS' },
                          { id: 'XS', label: 'XS' },
                          { id: 'S', label: 'S' },
                          { id: 'M', label: 'M' },
                          { id: 'L', label: 'L' },
                          { id: 'XL', label: 'XL' },
                          { id: '2XL', label: '2XL' },
                        ].filter((opt) => !selectedSizes.includes(opt.id));

                        return (
                          <div
                            key={field.id}
                            className="flex items-center gap-2"
                          >
                            <FormField>
                              <FormFieldController
                                control={control}
                                name={`variants.${index}.size`}
                                type="select"
                                placeholder="Taille"
                                options={sizeOptions}
                              />
                            </FormField>
                            <FormField>
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
                        );
                      })}
                      <div className="flex items-center justify-between">
                        <div>
                          Total:{' '}
                          {fields.reduce(
                            (acc, _, i) =>
                              acc + (watch(`variants.${i}.quantity`) || 0),
                            0
                          )}
                        </div>
                        <Button
                          onClick={() => append({ size: '', quantity: 0 })}
                        >
                          <PlusIcon />
                          <span>Ajouter une ligne</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
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

function mapFormToApi(
  values: FormFieldsGoodie
): z.infer<ReturnType<typeof zFormFieldsGoodie>> {
  if (values.hasVariants) {
    return {
      name: values.name,
      edition: values.edition ?? null,
      category: values.category as
        | 'TSHIRT'
        | 'HOODIE'
        | 'STICKER'
        | 'MUG'
        | 'TOTE_BAG'
        | 'NOTEBOOK'
        | 'OTHER',
      description: values.description ?? null,
      photoUrl: values.photoUrl ?? null,
      releaseDate: values.releaseDate ? new Date(values.releaseDate) : null,

      variants: values.variants.map((v) => ({
        key: `SIZE_${v.size}`,
        size: v.size,
        stockQty: v.quantity,
      })),
    };
  }

  return {
    name: values.name,
    edition: values.edition ?? null,
    category: values.category as
      | 'TSHIRT'
      | 'HOODIE'
      | 'STICKER'
      | 'MUG'
      | 'TOTE_BAG'
      | 'NOTEBOOK'
      | 'OTHER',
    description: values.description ?? null,
    photoUrl: values.photoUrl ?? null,
    releaseDate: values.releaseDate ? new Date(values.releaseDate) : null,

    total: values.totalQuantity,
    variants: [],
  };
}

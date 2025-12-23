import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { GiftIcon } from 'lucide-react';
import { useForm, useFormContext } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import {
  FormFieldsIdea,
  GOODIE_CATEGORY_OPTIONS,
  zFormFieldsIdea,
} from '../schema';

const FormGoodieIdea = () => {
  const form = useFormContext<FormFieldsIdea>();

  const categoriesGet = GOODIE_CATEGORY_OPTIONS.map((c) => ({
    id: c,
    label: c,
  }));

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Nom de l'idée</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Catégorie</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          name="category"
          options={categoriesGet}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Description de l'idée</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="description"
        />
      </FormField>
    </div>
  );
};

export const FormIdeaNew = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(zFormFieldsIdea()),
    defaultValues: {
      name: '',
      category: 'TSHIRT',
      description: '',
    },
  });

  const goodieIdeaCreate = useMutation(
    orpc.idea.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.goodie.getAll.key(),
          type: 'all',
        });
        if (canGoBack) router.history.back({ ignoreBlocker: true });
        else router.navigate({ to: '..', replace: true, ignoreBlocker: true });
        form.reset();
      },
    })
  );

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form {...form} onSubmit={(values) => goodieIdeaCreate.mutate(values)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 xs:flex-row">
            <div className="flex-2">
              <Card>
                <CardContent>
                  <FormGoodieIdea />
                </CardContent>
              </Card>
            </div>

            <div
              aria-hidden
              className="mx-auto w-full max-w-64 min-w-48 flex-1"
            >
              <GiftIcon />
            </div>
          </div>

          <Button
            type="submit"
            loading={goodieIdeaCreate.isPending}
            className="w-full"
          >
            + Ajouter l’idée
          </Button>
        </div>
      </Form>
    </>
  );
};

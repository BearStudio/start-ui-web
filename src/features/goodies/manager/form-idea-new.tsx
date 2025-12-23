import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

import { zFormFieldsIdea } from '../schema';
import { orpc } from '@/lib/orpc/client';
import { PreventNavigation } from '@/components/prevent-navigation';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/form';
import { Card, CardContent } from '@/components/ui/card';
import { GiftIcon } from 'lucide-react';

export const FormIdeaNew = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(zFormFieldsIdea()),
    values: {
      name: '',
      category: 'TSHIRT' as const,
      description: '',
    },
  });

  const goodieIdeaCreate = useMutation(
    orpc.goodie.createIdea.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.goodie.getAll.key(),
          type: 'all',
        });

        if (canGoBack) router.history.back({ ignoreBlocker: true });
        else router.navigate({ to: '..', replace: true, ignoreBlocker: true });
      },
    })
  );

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form
        {...form}
        onSubmit={async (values) => {
          goodieIdeaCreate.mutate(values);
        }}
      >
        <PageLayout>
          <PageLayoutTopBar
            backButton={<BackButton />}
            actions={
              <Button
                size="sm"
                type="submit"
                className="min-w-20"
                loading={goodieIdeaCreate.isPending}
              >
                {"Ajouter l'idée"}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {'Ajouter une nouvelle idée de goodies :'}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <div className="flex flex-col gap-4 xs:flex-row">
              <div className="flex-2">
                <Card>
                  <CardContent>{/* add form */}</CardContent>
                </Card>
              </div>
              <div
                aria-hidden
                className="mx-auto w-full max-w-64 min-w-48 flex-1"
              >
                <GiftIcon /> // to be fixed with real picture type
              </div>
            </div>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};

import { zodResolver } from '@hookform/resolvers/zod';
import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { match } from 'ts-pattern';

import { rolesNames } from '@/lib/auth/permissions';
import { orpc } from '@/lib/orpc/client';
import { getUiState } from '@/lib/ui-state';

import { BackButton } from '@/components/back-button';
import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { zFormFieldUser } from '@/features/user/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageUpdateUser = (props: { params: { id: string } }) => {
  const userQuery = useQuery(
    orpc.user.getById.queryOptions({ input: { id: props.params.id } })
  );

  const form = useForm({
    resolver: zodResolver(zFormFieldUser()),
    values: {
      name: userQuery.data?.name ?? '',
      email: userQuery.data?.email ?? '',
      role: userQuery.data?.role ?? 'user',
    },
  });

  const ui = getUiState((set) => {
    if (userQuery.status === 'pending') return set('pending');
    if (
      userQuery.status === 'error' &&
      userQuery.error instanceof ORPCError &&
      userQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (userQuery.status === 'error') return set('error');

    return set('default', { user: userQuery.data });
  });

  return (
    <Form {...form}>
      <PageLayout>
        <PageLayoutTopBar
          backButton={<BackButton />}
          actions={
            <>
              <Button size="sm" type="submit">
                Update
              </Button>
            </>
          }
        >
          <PageLayoutTopBarTitle>
            {match(ui.state)
              .with(ui.with('pending'), () => <Skeleton className="h-4 w-48" />)
              .with(ui.with('not-found'), ui.with('error'), () => (
                <AlertCircleIcon className="size-4 text-muted-foreground" />
              ))
              .with(ui.with('default'), ({ user }) => (
                <>{user.name || user.email}</>
              ))
              .exhaustive()}
          </PageLayoutTopBarTitle>
        </PageLayoutTopBar>
        <PageLayoutContent>
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4">
                <FormField>
                  <FormFieldLabel>Name</FormFieldLabel>
                  <FormFieldController
                    type="text"
                    control={form.control}
                    name="name"
                  />
                </FormField>
                <FormField>
                  <FormFieldLabel>Email</FormFieldLabel>
                  <FormFieldController
                    type="email"
                    control={form.control}
                    name="email"
                  />
                </FormField>
                <FormField>
                  <FormFieldLabel>Role</FormFieldLabel>
                  <FormFieldController
                    type="select"
                    control={form.control}
                    name="role"
                    options={rolesNames.map((role) => ({
                      label: role,
                      value: role,
                    }))}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </PageLayoutContent>
      </PageLayout>
    </Form>
  );
};

import { useMutation } from '@tanstack/react-query';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  Form,
  FormField,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { Button } from '@/platform/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/platform/components/ui/responsive-drawer';

import { zFormFieldsAccountUpdateName } from '@/modules/account/presentation/schema';
import { useAuthSession } from '@/modules/auth/client';

import { accountQueries } from './queries';

export const ChangeNameDrawer = (props: { children: ReactElement }) => {
  const { t } = useTranslation(['account']);
  const [open, setOpen] = useState(false);
  const session = useAuthSession();

  const updateUser = useMutation({
    ...accountQueries.updateInfo(),
    onSuccess: async () => {
      await session.refetch();
      toast.success(t('account:changeNameDrawer.successMessage'));
      form.reset();
      setOpen(false);
    },
    onError: () => toast.error(t('account:changeNameDrawer.errorMessage')),
  });

  const form = useAppForm({
    defaultValues: {
      name: session.data?.user.name ?? '',
    },
    validators: { onSubmit: zFormFieldsAccountUpdateName() },
    onSubmit: async ({ value: { name } }) => {
      await updateUser.mutateAsync({ name });
    },
  });

  return (
    <ResponsiveDrawer
      open={open}
      onOpenChange={(isOpen: boolean) => {
        setOpen(isOpen);
        form.reset();
      }}
    >
      <ResponsiveDrawerTrigger render={props.children} />

      <ResponsiveDrawerContent className="sm:max-w-xs">
        <Form form={form} className="flex flex-col gap-4">
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('account:changeNameDrawer.title')}
            </ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription className="sr-only">
              {t('account:changeNameDrawer.description')}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel className="sr-only">
                {t('account:changeNameDrawer.label')}
              </FormFieldLabel>
              <form.AppField name="name">
                {(field) => <field.FieldText type="text" size="lg" autoFocus />}
              </form.AppField>
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={updateUser.isPending}
            >
              {t('account:changeNameDrawer.submitButton')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};

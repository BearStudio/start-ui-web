import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { useUploadFile } from 'better-upload/client';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';

import {
  type FormFieldsAccountUpdateProfilePicture,
  zFormFieldsAccountUpdateProfilePicture,
} from '@/features/account/schema';
import { authClient } from '@/features/auth/client';

export const ChangeProfilePictureDrawer = (props: { children: ReactNode }) => {
  const { t } = useTranslation(['account']);
  const router = useRouter();
  const search = useSearch({ strict: false });
  const session = authClient.useSession();

  const form = useForm<FormFieldsAccountUpdateProfilePicture>({
    resolver: zodResolver(zFormFieldsAccountUpdateProfilePicture()),
    values: {
      avatarFileId: '',
    },
  });

  const avatarUpload = useUploadFile({
    route: 'avatar',
    onError: (error) => {
      form.setError('avatarFileId', {
        message: error.message || 'An error occurred',
      });
    },
  });

  const updateUser = useMutation(
    orpc.account.updateInfo.mutationOptions({
      onSuccess: async () => {
        session.refetch();
        toast.success(t('account:changeProfilePictureDrawer.successMessage'));
        form.reset();
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: '',
          },
        });
      },
      onError: () =>
        toast.error(t('account:changeProfilePictureDrawer.errorMessage')),
    })
  );

  return (
    <ResponsiveDrawer
      open={search.state === 'change-profile-picture'}
      onOpenChange={(open) => {
        form.reset();
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: open ? 'change-profile-picture' : '',
          },
        });
      }}
    >
      <ResponsiveDrawerTrigger asChild>
        {props.children}
      </ResponsiveDrawerTrigger>

      <ResponsiveDrawerContent className="sm:max-w-xs">
        <Form
          {...form}
          onSubmit={async () => {
            updateUser.mutate({
              avatarFileId: avatarUpload.uploadedFile?.objectKey,
            });
          }}
          className="flex flex-col gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('account:changeProfilePictureDrawer.title')}
            </ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription className="sr-only">
              {t('account:changeProfilePictureDrawer.description')}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel className="sr-only">
                {t('account:changeProfilePictureDrawer.label')}
              </FormFieldLabel>
              <FormFieldController
                control={form.control}
                type="file"
                name="avatarFileId"
                size="lg"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    avatarUpload.upload(e.target.files[0], {
                      metadata: {
                        userId: session.data?.user.id,
                      },
                    });
                  }
                }}
                autoFocus
              />
              {avatarUpload.isPending && (
                <FormFieldHelper>
                  Upload {avatarUpload.progress}%
                </FormFieldHelper>
              )}
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                (form.formState.isSubmitted && !form.formState.isValid) ||
                avatarUpload.isPending
              }
              loading={updateUser.isPending}
            >
              {t('account:changeProfilePictureDrawer.submitButton')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};

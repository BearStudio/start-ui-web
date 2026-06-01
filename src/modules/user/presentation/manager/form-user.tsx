import { useTranslation } from 'react-i18next';

import { withForm } from '@/platform/components/form';
import {
  FormField,
  FormFieldHelper,
  FormFieldLabel,
} from '@/platform/components/form';

import { rolesNames } from '@/modules/auth';
import { useAuthSession } from '@/modules/auth/client';
import type { UserId } from '@/modules/kernel/domain/ids';

import { type FormFieldsUser, zFormFieldsUser } from '../schema';

export const formUserDefaultValues = (
  values?: Partial<FormFieldsUser>
): FormFieldsUser => ({
  name: values?.name ?? '',
  email: values?.email ?? '',
  role: values?.role ?? 'user',
});

export const formUserValidators = {
  onSubmit: zFormFieldsUser(),
} as const;

/**
 * Reusable user form fields bound to a parent form's `name`, `email`, `role`.
 * Designed to be embedded inside `useAppForm({ defaultValues, validators })`
 * on the page that owns the submit handler.
 */
export const FormUser = withForm({
  defaultValues: formUserDefaultValues(),
  props: {} as { userId?: UserId },
  render: ({ form, userId }) => {
    const { t } = useTranslation(['user']);
    const session = useAuthSession();
    const isCurrentUser = !!userId && userId === session.data?.user.id;

    return (
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>{t('user:common.name.label')}</FormFieldLabel>
          <form.AppField name="name">
            {(field) => <field.FieldText type="text" autoFocus />}
          </form.AppField>
        </FormField>
        <FormField>
          <FormFieldLabel>{t('user:common.email.label')}</FormFieldLabel>
          <form.AppField name="email">
            {(field) => <field.FieldText type="email" />}
          </form.AppField>
        </FormField>
        <FormField>
          <FormFieldLabel>{t('user:common.role.label')}</FormFieldLabel>
          <form.AppField name="role">
            {(field) => (
              <field.FieldSelect
                disabled={isCurrentUser}
                items={rolesNames.map((role) => ({
                  value: role,
                  label: role,
                }))}
              />
            )}
          </form.AppField>
          {isCurrentUser && (
            <FormFieldHelper>
              {t('user:common.role.cannotUpdateOwnRole')}
            </FormFieldHelper>
          )}
        </FormField>
      </div>
    );
  },
});

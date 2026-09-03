import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
  useFormContext,
} from '@/components/form';

import { authClient } from '@/features/auth/client';
import { rolesNames } from '@/features/auth/permissions';
import { FormFieldsUser } from '@/features/user/schema';

export const FormUser = (props: { userId?: string }) => {
  const { t } = useTranslation(['user']);
  const session = authClient.useSession();
  const form = useFormContext<FormFieldsUser>();
  const isCurrentUser = props.userId === session.data?.user.id;

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>{t('user:common.name.label')}</FormFieldLabel>
        <FormFieldController type="text" form={form} name="name" autoFocus />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('user:common.email.label')}</FormFieldLabel>
        <FormFieldController type="email" form={form} name="email" />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('user:common.role.label')}</FormFieldLabel>
        <FormFieldController
          type="select"
          form={form}
          name="role"
          disabled={isCurrentUser}
          items={rolesNames.map((role) => ({
            value: role,
            label: role,
          }))}
        />
        {isCurrentUser && (
          <FormFieldHelper>
            {t('user:common.role.cannotUpdateOwnRole')}
          </FormFieldHelper>
        )}
      </FormField>
    </div>
  );
};

import { authClient } from '@/lib/auth/client';
import { rolesNames } from '@/lib/auth/permissions';
import { withForm } from '@/lib/form/config';

import { FormFieldHelper } from '@/components/form';

import { FormFieldsUser } from '@/features/user/schema';

export const FormUser = withForm<FormFieldsUser, { userId?: string }>({
  props: { userId: undefined },
  render: ({ form, userId }) => {
    const session = authClient.useSession();
    const isCurrentUser = userId === session.data?.user.id;

    return (
      <div className="flex flex-col gap-4">
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText autoFocus />
            </field.FormField>
          )}
        </form.AppField>
        <form.AppField name="email">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Email</field.FormFieldLabel>
              <field.FieldText type="email" />
            </field.FormField>
          )}
        </form.AppField>

        <form.AppField name="role">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Role</field.FormFieldLabel>
              <field.FieldSelect
                readOnly={isCurrentUser}
                options={rolesNames.map((role) => ({
                  label: role,
                  id: role,
                }))}
              />
              {isCurrentUser && (
                <FormFieldHelper>
                  You can't update your own role.
                </FormFieldHelper>
              )}
            </field.FormField>
          )}
        </form.AppField>
      </div>
    );
  },
});

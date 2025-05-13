import { formOptions } from '@tanstack/react-form';

import { authClient } from '@/lib/auth/client';
import { rolesNames, zRole } from '@/lib/auth/permissions';
import { withForm } from '@/lib/form/config';

import { FormFieldHelper } from '@/components/form';

export const formUserOptions = formOptions({
  // TODO fix type to reactivate validators
  // validators: { onSubmit: zFormFieldsUser() },
  defaultValues: {
    name: '',
    email: '',
    role: zRole().parse('user'),
  },
});

export const FormUser = withForm({
  ...formUserOptions,
  props: { userId: undefined } as { userId?: string },
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

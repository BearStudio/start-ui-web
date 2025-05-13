import { useFormContext } from 'react-hook-form';

import { authClient } from '@/lib/auth/client';
import { rolesNames } from '@/lib/auth/permissions';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsUser } from '@/features/user/schema';

export const FormUser = (props: { userId?: string }) => {
  const session = authClient.useSession();
  const form = useFormContext<FormFieldsUser>();
  const isCurrentUser = props.userId === session.data?.user.id;

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Email</FormFieldLabel>
        <FormFieldController type="email" control={form.control} name="email" />
      </FormField>
      <FormField>
        <FormFieldLabel>Role</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          name="role"
          readOnly={isCurrentUser}
          options={rolesNames.map((role) => ({
            label: role,
            id: role,
          }))}
        />
        {isCurrentUser && (
          <FormFieldHelper>You can't update your own role.</FormFieldHelper>
        )}
      </FormField>
    </div>
  );
};

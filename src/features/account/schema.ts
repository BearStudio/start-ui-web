import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type FormFieldsAccountUpdateName = z.infer<
  ReturnType<typeof zFormFieldsAccountUpdateName>
>;
export const zFormFieldsAccountUpdateName = () =>
  z.object({
    name: zu.fieldText.required(),
  });

export type FormFieldsAccountUpdateProfilePicture = z.infer<
  ReturnType<typeof zFormFieldsAccountUpdateProfilePicture>
>;
export const zFormFieldsAccountUpdateProfilePicture = () =>
  z.object({
    avatarFileId: zu.string.nonEmpty(z.string()),
  });

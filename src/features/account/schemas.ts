import { z } from 'zod';

import { zUser, zUserWithEmail } from '@/features/users/schemas';
import { zFieldUploadValue } from '@/files/schemas';

export type UserAccount = z.infer<ReturnType<typeof zUserAccount>>;
export const zUserAccount = () =>
  zUser().pick({
    id: true,
    name: true,
    email: true,
    image: true,
    isEmailVerified: true,
    authorizations: true,
    language: true,
  });

export type UserAccountWithEmail = z.infer<
  ReturnType<typeof zUserAccountWithEmail>
>;
export const zUserAccountWithEmail = () =>
  zUserWithEmail().pick({
    id: true,
    name: true,
    email: true,
    authorizations: true,
    language: true,
  });

export type FormFieldsAccountEmail = z.infer<
  ReturnType<typeof zFormFieldsAccountEmail>
>;
export const zFormFieldsAccountEmail = () =>
  zUserAccountWithEmail().pick({ email: true });

export type FormFieldsAccountProfile = z.infer<
  ReturnType<typeof zFormFieldsAccountProfile>
>;

export const zFormFieldsAccountProfile = () =>
  zUser()
    .pick({
      name: true,
      language: true,
    })
    .merge(
      z.object({
        image: zFieldUploadValue(['image']).optional(),
      })
    );

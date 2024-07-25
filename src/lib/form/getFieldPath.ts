import { FieldPath, FieldValues } from 'react-hook-form';

/**
 * Use this function to build a path for a form. This function will type check
 * the name to make sure you don't have typo or inexistant field path.
 *
 * Example:
 * ```
 * const zPasswordForm = () => z.object({ currentPassword: z.string(), newPassword: z.string() });
 * type PasswordForm = z.infer<ReturnType<typeof zPasswordForm>>;
 *
 * zPasswordForm()
 *  .superRefine((obj, ctx) => {
 *    if (obj.currentPassword === obj.newPassword) {
 *      ctx.addIssue({
 *        code: z.ZodIssueCode.custom,
 *        path: getFieldPath<PasswordForm>('currentPassword'), // typed checked
 *        message: 'The password should not be the same',
 *      });
 *    }
 * })
 *
 * ```
 * @param name The name that will be type checked and split.
 * @returns The array made from the name (splitted on '.')
 */
export function getFieldPath<TFieldValues extends FieldValues>(
  name: FieldPath<TFieldValues>
) {
  return name.split('.');
}

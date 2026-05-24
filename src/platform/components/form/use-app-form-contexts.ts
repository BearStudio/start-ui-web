import { createFormHookContexts } from '@tanstack/react-form';

/**
 * Shared TanStack Form field/form contexts used by both the bound
 * `useAppForm` and individual field components.
 *
 * Split into its own module so a field component can pull the TF context
 * without re-importing `createFormHook` (which transitively binds every
 * field component and would create cycles).
 */
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

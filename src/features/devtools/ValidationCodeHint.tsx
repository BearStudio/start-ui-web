import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { env } from '@/env.mjs';
import { FormFieldsVerificationCode } from '@/features/auth/schemas';
import { VALIDATION_CODE_MOCKED } from '@/features/auth/utils';

export const ValidationCodeHint = () => {
  const form = useFormContext<FormFieldsVerificationCode>();

  if (env.NEXT_PUBLIC_NODE_ENV !== 'development' && !env.NEXT_PUBLIC_IS_DEMO)
    return null;

  return (
    <Alert status="info">
      <AlertIcon />
      <AlertTitle textTransform="capitalize">
        {env.NEXT_PUBLIC_IS_DEMO ? 'Demo mode' : env.NEXT_PUBLIC_NODE_ENV}
      </AlertTitle>
      <AlertDescription>
        To quickly connect, use the code{' '}
        <ChakraLink
          as="button"
          type="button"
          fontWeight="bold"
          onClick={() => form.setValue('code', VALIDATION_CODE_MOCKED)}
        >
          {VALIDATION_CODE_MOCKED}
        </ChakraLink>
      </AlertDescription>
    </Alert>
  );
};

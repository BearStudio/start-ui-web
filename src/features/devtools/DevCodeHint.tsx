import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useFormContext } from '@formiz/core';

import { env } from '@/env.mjs';
import { VALIDATION_CODE_MOCKED } from '@/features/auth/utils';

export const DevCodeHint = () => {
  const form = useFormContext();

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
          onClick={() =>
            form.setValues({
              code: VALIDATION_CODE_MOCKED,
            })
          }
        >
          {VALIDATION_CODE_MOCKED}
        </ChakraLink>
      </AlertDescription>
    </Alert>
  );
};

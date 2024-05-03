import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useFormContext } from '@formiz/core';

import { env } from '@/env.mjs';

export const LoginHint = () => {
  const form = useFormContext();
  const mockedEmail = 'admin@admin.com';

  if (env.NEXT_PUBLIC_NODE_ENV !== 'development' && !env.NEXT_PUBLIC_IS_DEMO)
    return null;

  return (
    <Alert status="info">
      <AlertIcon />
      <AlertTitle textTransform="capitalize">
        {env.NEXT_PUBLIC_IS_DEMO ? 'Demo mode' : env.NEXT_PUBLIC_NODE_ENV}
      </AlertTitle>
      <AlertDescription>
        Enjoy the features! You can sign in with{' '}
        <ChakraLink
          as="button"
          type="button"
          fontWeight="bold"
          onClick={() =>
            form.setValues({
              email: mockedEmail,
            })
          }
        >
          {mockedEmail}
        </ChakraLink>
      </AlertDescription>
    </Alert>
  );
};

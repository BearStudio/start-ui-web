import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useFormContext } from '@formiz/core';

export const DevLoginHint = () => {
  const form = useFormContext();
  const mockedEmail = 'admin@admin.com';
  const mockedPassword = 'admin';

  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.NEXT_PUBLIC_IS_DEMO === 'true'
  )
    return null;

  return (
    <Alert status="info">
      <AlertIcon />
      <AlertTitle>Development</AlertTitle>
      <AlertDescription>
        You can login with{' '}
        <ChakraLink
          as="button"
          type="button"
          fontWeight="bold"
          onClick={() =>
            form.setValues({
              email: mockedEmail,
              password: mockedPassword,
            })
          }
        >
          {mockedEmail}
        </ChakraLink>{' '}
        (Password: {mockedPassword}) account.
      </AlertDescription>
    </Alert>
  );
};

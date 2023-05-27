import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useFormContext } from '@formiz/core';

export const DemoLoginHint = () => {
  const form = useFormContext();
  const mockedUsername = 'admin';
  const mockedPassword = 'admin';

  if (process.env.NEXT_PUBLIC_IS_DEMO !== 'true') return null;

  return (
    <Alert status="info">
      <AlertIcon />
      <AlertTitle>Demo Mode</AlertTitle>
      <AlertDescription>
        This is a read-only demo, but you can log in with the{' '}
        <ChakraLink
          as="button"
          type="button"
          fontWeight="bold"
          onClick={() =>
            form.setValues({
              username: mockedUsername,
              password: mockedPassword,
            })
          }
        >
          {mockedUsername}/{mockedPassword}
        </ChakraLink>{' '}
        account. Just remember, no changes can be made. Enjoy the features!
      </AlertDescription>
    </Alert>
  );
};

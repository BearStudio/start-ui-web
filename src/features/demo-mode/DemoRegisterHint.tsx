import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const DemoRegisterHint = () => {
  if (process.env.NEXT_PUBLIC_IS_DEMO !== 'true') return null;

  return (
    <Alert status="warning">
      <AlertIcon />
      <AlertTitle>Demo Mode</AlertTitle>
      <AlertDescription>
        This is a read-only demo, but you can{' '}
        <ChakraLink as={Link} to="/login" fontWeight="bold">
          log in
        </ChakraLink>{' '}
        to test some of the features. Just remember, no changes can be made.
        Enjoy the features!
      </AlertDescription>
    </Alert>
  );
};

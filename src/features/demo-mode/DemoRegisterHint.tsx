import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';

import { env } from '@/env.mjs';

type DemoRegisterHintProps = {
  loginPath: string;
};

export const DemoRegisterHint = ({ loginPath }: DemoRegisterHintProps) => {
  if (!env.NEXT_PUBLIC_IS_DEMO) return null;

  return (
    <Alert status="warning">
      <AlertIcon />
      <AlertTitle>Demo Mode</AlertTitle>
      <AlertDescription>
        This is a read-only demo, but you can{' '}
        <ChakraLink as={Link} href={loginPath} fontWeight="bold">
          Sign in
        </ChakraLink>{' '}
        to test some of the features. Just remember, no changes can be made.
        Enjoy the features!
      </AlertDescription>
    </Alert>
  );
};

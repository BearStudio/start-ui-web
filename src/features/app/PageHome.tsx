import React from 'react';

import { Flex } from '@chakra-ui/react';

import { Logo } from '@/components/Logo';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';

export default function PageHome() {
  return (
    <AppLayoutPage>
      <Flex
        display={{ base: 'flex', md: 'none' }}
        py={4}
        alignItems="center"
        justifyContent="center"
      >
        <Logo />
      </Flex>
      Home {/* TODO translations */}
    </AppLayoutPage>
  );
}

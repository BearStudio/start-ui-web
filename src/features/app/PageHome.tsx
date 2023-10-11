import React from 'react';

import { Container, Flex } from '@chakra-ui/react';

import { Logo } from '@/components/Logo';

export default function PageHome() {
  return (
    <Container>
      <Flex
        display={{ base: 'flex', md: 'none' }}
        py={4}
        alignItems="center"
        justifyContent="center"
      >
        <Logo />
      </Flex>
      Home {/* TODO translations */}
    </Container>
  );
}

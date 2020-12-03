import React from 'react';

import { Box, Heading, Link, Text } from '@chakra-ui/react';

import { ActionsButton } from '../ActionsButton';
import { HitZone } from '../HitZone';

export default {
  title: 'components/HitZone',
  parameters: {
    docs: {
      description: {
        component: `The HitZone component allows you to extends the hit-zone area of an
          interactive element to fill his first positioned parent.
          <br />
          This with the ability to keep other interactive elements clickable.
        `,
      },
    },
  },
};

export const Default = () => (
  <Box
    position="relative"
    bg="brand.800"
    color="white"
    boxShadow="lg"
    borderRadius="md"
    p="4"
    transition="0.2s"
    _hover={{ bg: 'brand.900' }}
    _focusWithin={{ boxShadow: 'outline' }}
  >
    <Heading
      as="a"
      href="#"
      size="md"
      _focus={{ outline: 'none' }}
      onClick={(e) => {
        e.preventDefault();
        alert('Main action clicked!');
      }}
    >
      <HitZone />
      Main action
    </Heading>
    <Text>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. In assumenda
      repellat nam, dolores cupiditate deserunt soluta sapiente cumque nostrum
      odio modi ipsum laboriosam. Dignissimos ratione omnis necessitatibus unde
      error eum?
    </Text>
    <Link
      display="inline-block"
      color="brand.200"
      fontWeight="bold"
      mt="2"
      position="relative" // Use position="relative" to put this link above the HitZone
      onClick={(e) => {
        e.preventDefault();
        alert('Another link clicked!');
      }}
    >
      Another link clickable
    </Link>
    <ActionsButton
      position="absolute"
      top="2"
      right="2"
      onClick={() => alert('Secondary action clicked!')}
    />
  </Box>
);

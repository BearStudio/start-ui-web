import React from 'react';

import { Text, SimpleGrid } from '@chakra-ui/react';
import { HiUser } from 'react-icons/hi';

import { Icon, IconExample } from './';

export default {
  title: 'Components/Icons',
};

export const ReactIcons = () => (
  <Text>
    This is a HiUser <Icon icon={HiUser} /> icon from react-icons.
  </Text>
);

export const CustomIcons = () => (
  <>
    <Text>
      This is a custom <IconExample /> icon from a custom SVG.
    </Text>
  </>
);

export const AllCustomIcons = () => (
  <>
    <SimpleGrid minChildWidth="2rem" fontSize="2rem">
      <IconExample />
    </SimpleGrid>
  </>
);

import React, { ReactElement } from 'react';

import { SimpleGrid, Text, Tooltip, useClipboard } from '@chakra-ui/react';
import { LuUser } from 'react-icons/lu';

import { Icon, IconSortAsc } from '.';
import * as icons from './icons-generated';

export default {
  title: 'Components/Icons',
};

export const ReactIcons = () => (
  <Text>
    This is a LuUser <Icon icon={LuUser} /> icon from react-icons.
  </Text>
);

export const CustomIcons = () => (
  <>
    <Text>
      This is a custom <IconSortAsc /> icon from a custom SVG.
    </Text>
  </>
);

const CustomIcon = ({
  children,
  name,
}: {
  children: ReactElement;
  name: string;
}) => {
  const { hasCopied, onCopy } = useClipboard(name);
  const icon = React.cloneElement(children, { onClick: onCopy });

  return (
    <Tooltip label={hasCopied ? 'Copied!' : name} closeOnClick={false}>
      {icon}
    </Tooltip>
  );
};

export const AllCustomIcons = () => (
  <>
    <SimpleGrid minChildWidth="2rem" gap={4} fontSize="2rem">
      {Object.entries(icons).map(([name, Icon]) => (
        <CustomIcon name={name} key={name}>
          <Icon />
        </CustomIcon>
      ))}
    </SimpleGrid>
  </>
);

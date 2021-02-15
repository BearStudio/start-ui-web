import { Badge, Box } from '@chakra-ui/react';
import { FiCheck, FiX } from 'react-icons/fi';

import { Icon } from '@/components';

export const UserStatus = ({ isActivated = false, ...rest }) => {
  return isActivated ? (
    <Badge size="sm" colorScheme="success" {...rest}>
      <Box as="span" d={{ base: 'none', md: 'block' }}>
        Activated
      </Box>
      <Icon
        icon={FiCheck}
        aria-label="Activated"
        d={{ base: 'inline-flex', md: 'none' }}
      />
    </Badge>
  ) : (
    <Badge size="sm" colorScheme="warning" {...rest}>
      <Box as="span" d={{ base: 'none', md: 'block' }}>
        Not Activated
      </Box>
      <Icon
        icon={FiX}
        aria-label="Not Activated"
        d={{ base: 'inline-flex', md: 'none' }}
      />
    </Badge>
  );
};

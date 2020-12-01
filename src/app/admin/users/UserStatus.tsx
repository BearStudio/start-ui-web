import { Badge, Box, Icon } from '@chakra-ui/react';
import { Check, X } from 'phosphor-react';

export const UserStatus = ({ isActivated = false, ...rest }) => {
  return isActivated ? (
    <Badge size="sm" colorScheme="success" {...rest}>
      <Box as="span" d={{ base: 'none', md: 'block' }}>
        Activated
      </Box>
      <Icon
        as={Check}
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
        as={X}
        aria-label="Not Activated"
        d={{ base: 'inline-flex', md: 'none' }}
      />
    </Badge>
  );
};

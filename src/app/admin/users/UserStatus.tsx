import { Badge, Box, Icon } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiX } from 'react-icons/fi';

export const UserStatus = ({ isActivated = false, ...rest }) => {
  const { t } = useTranslation()
  return isActivated ? (
    <Badge size="sm" colorScheme="success" {...rest}>
      <Box as="span" d={{ base: 'none', md: 'block' }}>
        {t('admin:users.activated')}
      </Box>
      <Icon
        as={FiCheck}
        aria-label={t('admin:users.activated')}
        d={{ base: 'inline-flex', md: 'none' }}
      />
    </Badge>
  ) : (
    <Badge size="sm" colorScheme="warning" {...rest}>
      <Box as="span" d={{ base: 'none', md: 'block' }}>
        {t('admin:users.notActivated')}
      </Box>
      <Icon
        as={FiX}
        aria-label={t('admin:users.notActivated')}
        d={{ base: 'inline-flex', md: 'none' }}
      />
    </Badge>
  );
};

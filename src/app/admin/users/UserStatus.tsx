import { Badge, Box, Icon } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiX } from 'react-icons/fi';

export const UserStatus = ({ isActivated = false, ...rest }) => {
  const { t } = useTranslation()
  return isActivated ? (
    <Badge size="sm" colorScheme="success" {...rest}>
      <Box as="span" d={{ base: 'none', md: 'block' }}>
        {t('admin:activated')}
      </Box>
      <Icon
        as={FiCheck}
        aria-label={t('admin:activated')}
        d={{ base: 'inline-flex', md: 'none' }}
      />
    </Badge>
  ) : (
    <Badge size="sm" colorScheme="warning" {...rest}>
      <Box as="span" d={{ base: 'none', md: 'block' }}>
        {t('admin:notActivated')}
      </Box>
      <Icon
        as={FiX}
        aria-label={t('admin:notActivated')}
        d={{ base: 'inline-flex', md: 'none' }}
      />
    </Badge>
  );
};

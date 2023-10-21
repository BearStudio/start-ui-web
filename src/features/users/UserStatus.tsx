import { Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuCheck, LuX } from 'react-icons/lu';

export const UserStatus = ({ isActivated = false, ...rest }) => {
  const { t } = useTranslation(['users']);
  return isActivated ? (
    <Tag
      size="sm"
      px={{ base: 0, lg: 2 }}
      justifyContent="center"
      alignItems="center"
      colorScheme="success"
      gap={1}
      whiteSpace="nowrap"
      {...rest}
    >
      <TagLeftIcon
        as={LuCheck}
        m={0}
        aria-label={t('users:data.status.activated')}
      />
      <TagLabel display={{ base: 'none', lg: 'inline-flex' }} lineHeight={1}>
        {t('users:data.status.activated')}
      </TagLabel>
    </Tag>
  ) : (
    <Tag
      size="sm"
      px={{ base: 0, lg: 2 }}
      justifyContent="center"
      alignItems="center"
      colorScheme="warning"
      whiteSpace="nowrap"
      gap={1}
      {...rest}
    >
      <TagLeftIcon
        as={LuX}
        aria-label={t('users:data.status.deactivated')}
        m={0}
      />
      <TagLabel display={{ base: 'none', lg: 'inline-flex' }} lineHeight={1}>
        {t('users:data.status.deactivated')}
      </TagLabel>
    </Tag>
  );
};

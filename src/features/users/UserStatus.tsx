import {
  Tag,
  TagLabel,
  TagLeftIcon,
  TagProps,
  ThemeTypings,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuCheck, LuX } from 'react-icons/lu';

export type UserStatusProps = TagProps & {
  isActivated?: boolean;
  showLabelBreakpoint?: ThemeTypings['breakpoints'];
};

export const UserStatus = ({
  isActivated = false,
  showLabelBreakpoint = 'base',
  ...rest
}: UserStatusProps) => {
  const { t } = useTranslation(['users']);
  return isActivated ? (
    <Tag
      size="sm"
      px={{ base: 0, [showLabelBreakpoint]: 2 }}
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
      <TagLabel
        display={{ base: 'none', [showLabelBreakpoint]: 'inline-flex' }}
        lineHeight={1}
      >
        {t('users:data.status.activated')}
      </TagLabel>
    </Tag>
  ) : (
    <Tag
      size="sm"
      px={{ base: 0, [showLabelBreakpoint]: 2 }}
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
      <TagLabel
        display={{ base: 'none', [showLabelBreakpoint]: 'inline-flex' }}
        lineHeight={1}
      >
        {t('users:data.status.deactivated')}
      </TagLabel>
    </Tag>
  );
};

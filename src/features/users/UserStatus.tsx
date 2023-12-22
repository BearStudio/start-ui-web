import { Tag, TagLabel, TagLeftIcon, ThemeTypings } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuCheck, LuX } from 'react-icons/lu';

export type UserStatusProps = {
  isActivated?: boolean;
  showLabelBreakpoint?: ThemeTypings['breakpoints'];
};

export const UserStatus = ({
  isActivated = false,
  showLabelBreakpoint = 'base',
}: UserStatusProps) => {
  const { t } = useTranslation(['users']);

  return (
    <Tag
      size="sm"
      colorScheme={isActivated ? 'success' : 'warning'}
      gap={1}
      justifyContent="center"
      px={{ base: 0, [showLabelBreakpoint]: 2 }}
    >
      <TagLeftIcon
        as={isActivated ? LuCheck : LuX}
        mr={0}
        aria-label={
          isActivated
            ? t('users:data.status.activated')
            : t('users:data.status.deactivated')
        }
      />
      <TagLabel
        lineHeight={1}
        display={{ base: 'none', [showLabelBreakpoint]: 'inline' }}
        whiteSpace="nowrap"
      >
        {isActivated
          ? t('users:data.status.activated')
          : t('users:data.status.deactivated')}
      </TagLabel>
    </Tag>
  );
};

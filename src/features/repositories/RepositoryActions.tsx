import React from 'react';

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuProps,
  Portal,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LuEdit3, LuEye, LuTrash2 } from 'react-icons/lu';

import { ActionsButton } from '@/components/ActionsButton';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Icon } from '@/components/Icons';
import { useToastError } from '@/components/Toast';
import { useRepositoryRemove } from '@/features/repositories/api.client';
import { Repository } from '@/features/repositories/api.contract';

export type RepositoryActionProps = Omit<MenuProps, 'children'> & {
  repository: Repository;
};

export const RepositoryActions = ({
  repository,
  ...rest
}: RepositoryActionProps) => {
  const { t } = useTranslation(['common', 'repositories']);

  const toastError = useToastError();

  const repositoryRemove = useRepositoryRemove({
    onError: () => {
      toastError({
        title: t('repositories:feedbacks.deleteRepositoryError.title'),
        description: t(
          'repositories:feedbacks.deleteRepositoryError.description'
        ),
      });
    },
  });

  return (
    <Menu placement="left-start" {...rest}>
      <MenuButton as={ActionsButton} isLoading={repositoryRemove.isLoading} />
      <Portal>
        <MenuList>
          <MenuItem
            as={Link}
            href={`/repositories/${repository.id}`}
            icon={<Icon icon={LuEye} fontSize="lg" color="gray.400" />}
          >
            {t('repositories:list.actions.view')}
          </MenuItem>
          <MenuItem
            as={Link}
            href={`/repositories/${repository.id}/update`}
            icon={<Icon icon={LuEdit3} fontSize="lg" color="gray.400" />}
          >
            {t('common:actions.edit')}
          </MenuItem>
          <ConfirmModal
            title={t('repositories:deleteModal.title')}
            message={t('repositories:deleteModal.message', {
              name: repository.name,
            })}
            onConfirm={() =>
              repositoryRemove.mutate({
                params: { id: repository.id.toString() },
                body: {},
              })
            }
            confirmText={t('common:actions.delete')}
            confirmVariant="@danger"
            size="sm"
          >
            <MenuItem
              icon={<Icon icon={LuTrash2} fontSize="lg" color="gray.400" />}
            >
              {t('common:actions.delete')}
            </MenuItem>
          </ConfirmModal>
        </MenuList>
      </Portal>
    </Menu>
  );
};

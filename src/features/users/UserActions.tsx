import React from 'react';

import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuProps,
  Portal,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuCheckCircle, LuEdit3, LuTrash2, LuXCircle } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { ActionsButton } from '@/components/ActionsButton';
import { ConfirmMenuItem } from '@/components/ConfirmMenuItem';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Icon } from '@/components/Icons';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useUserRemove, useUserUpdate } from '@/features/users/api.client';
import { User } from '@/features/users/api.contract';

export type UserActionProps = Omit<MenuProps, 'children'> & {
  user: User;
};

export const UserActions = ({ user, ...rest }: UserActionProps) => {
  const { t } = useTranslation(['common', 'users']);

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const userUpdate = useUserUpdate({
    onSuccess: ({ body: { activated, login } }) => {
      if (activated) {
        toastSuccess({
          title: t('users:feedbacks.activateUserSuccess.title'),
          description: t('users:feedbacks.activateUserSuccess.description', {
            login,
          }),
        });
      } else {
        toastSuccess({
          title: t('users:feedbacks.deactivateUserSuccess.title'),
          description: t('users:feedbacks.deactivateUserSuccess.description', {
            login,
          }),
        });
      }
    },
    onError: (_, { body }) => {
      if (body?.activated) {
        toastError({
          title: t('users:feedbacks.activateUserError.title'),
          description: t('users:feedbacks.activateUserError.description', {
            login: body?.login ?? '??',
          }),
        });
      } else {
        toastError({
          title: t('users:feedbacks.deactivateUserError.title'),
          description: t('users:feedbacks.deactivateUserError.description', {
            login: body?.login ?? '??',
          }),
        });
      }
    },
  });

  const activateUser = () =>
    userUpdate.mutate({ body: { ...user, activated: true } });
  const deactivateUser = () =>
    userUpdate.mutate({ body: { ...user, activated: false } });

  const userRemove = useUserRemove({
    onSuccess: (_, { params: { login } }) => {
      toastSuccess({
        title: t('users:feedbacks.deleteUserSuccess.title'),
        description: t('users:feedbacks.deleteUserSuccess.description', {
          login,
        }),
      });
    },
    onError: (_, { params: { login } }) => {
      toastError({
        title: t('users:feedbacks.deleteUserError.title'),
        description: t('users:feedbacks.deleteUserError.description', {
          login,
        }),
      });
    },
  });
  const removeUser = () =>
    userRemove.mutate({ params: { login: user.login }, body: {} });

  return (
    <Menu placement="left-start" {...rest}>
      <MenuButton
        as={ActionsButton}
        isLoading={userUpdate.isLoading || userRemove.isLoading}
      />
      <Portal>
        <MenuList>
          <MenuItem
            as={Link}
            to={`/admin/users/${user.login}`}
            icon={<Icon icon={LuEdit3} fontSize="lg" color="gray.400" />}
          >
            {t('common:actions.edit')}
          </MenuItem>
          {user.activated ? (
            <ConfirmMenuItem
              onClick={deactivateUser}
              icon={<Icon icon={LuXCircle} fontSize="lg" color="gray.400" />}
            >
              {t('common:actions.deactivate')}
            </ConfirmMenuItem>
          ) : (
            <ConfirmMenuItem
              onClick={activateUser}
              icon={
                <Icon icon={LuCheckCircle} fontSize="lg" color="gray.400" />
              }
            >
              {t('common:actions.activate')}
            </ConfirmMenuItem>
          )}
          <MenuDivider />
          <ConfirmModal
            title={t('users:deleteModal.title')}
            message={t('users:deleteModal.message', { name: user.login })}
            onConfirm={() => removeUser()}
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

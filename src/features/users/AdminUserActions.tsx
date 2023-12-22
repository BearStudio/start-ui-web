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
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LuCheckCircle, LuPenLine, LuTrash2, LuXCircle } from 'react-icons/lu';

import { ActionsButton } from '@/components/ActionsButton';
import { ConfirmMenuItem } from '@/components/ConfirmMenuItem';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Icon } from '@/components/Icons';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { ADMIN_PATH } from '@/features/admin/constants';
import { trpc } from '@/lib/trpc/client';
import type { RouterOutputs } from '@/lib/trpc/types';

export type AdminUserActionProps = Omit<MenuProps, 'children'> & {
  user: RouterOutputs['users']['getAll']['items'][number];
};

export const AdminUserActions = ({ user, ...rest }: AdminUserActionProps) => {
  const { t } = useTranslation(['common', 'users']);
  const account = trpc.account.get.useQuery();
  const trpcUtils = trpc.useUtils();
  const isCurrentUser = account.data?.id === user.id;

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const activateUser = trpc.users.activate.useMutation({
    onSuccess: async ({ email, name }) => {
      await trpcUtils.users.invalidate();
      toastSuccess({
        title: t('users:feedbacks.activateUserSuccess.title'),
        description: t('users:feedbacks.activateUserSuccess.description', {
          login: name ?? email,
        }),
      });
    },
    onError: () => {
      toastError({
        title: t('users:feedbacks.activateUserError.title'),
        description: t('users:feedbacks.activateUserError.description', {
          login: user.name ?? user.email,
        }),
      });
    },
  });
  const deactivateUser = trpc.users.deactivate.useMutation({
    onSuccess: async ({ email, name }) => {
      await trpcUtils.users.invalidate();
      toastSuccess({
        title: t('users:feedbacks.deactivateUserSuccess.title'),
        description: t('users:feedbacks.deactivateUserSuccess.description', {
          login: name ?? email,
        }),
      });
    },
    onError: () => {
      toastError({
        title: t('users:feedbacks.deactivateUserError.title'),
        description: t('users:feedbacks.deactivateUserError.description', {
          login: user.name ?? user.email,
        }),
      });
    },
  });

  const removeUser = trpc.users.removeById.useMutation({
    onSuccess: async () => {
      await trpcUtils.users.getAll.invalidate();
    },
    onError: () => {
      toastError({
        title: t('users:feedbacks.deleteUserError.title'),
        description: t('users:feedbacks.deleteUserError.description', {
          login: user.name ?? user.email,
        }),
      });
    },
  });

  const isLoading =
    activateUser.isLoading || deactivateUser.isLoading || removeUser.isLoading;

  return (
    <Menu placement="left-start" {...rest}>
      <MenuButton as={ActionsButton} isLoading={isLoading} />
      <Portal>
        <MenuList>
          <MenuItem
            as={Link}
            href={`${ADMIN_PATH}/management/users/${user.id}`}
            icon={<Icon icon={LuPenLine} fontSize="lg" color="gray.400" />}
          >
            {t('common:actions.edit')}
          </MenuItem>
          {!isCurrentUser && (
            <>
              {user.accountStatus === 'ENABLED' && (
                <ConfirmMenuItem
                  onClick={() => deactivateUser.mutate({ id: user.id })}
                  icon={
                    <Icon icon={LuXCircle} fontSize="lg" color="gray.400" />
                  }
                >
                  {t('common:actions.deactivate')}
                </ConfirmMenuItem>
              )}
              {(user.accountStatus === 'NOT_VERIFIED' ||
                user.accountStatus === 'DISABLED') && (
                <ConfirmMenuItem
                  onClick={() => activateUser.mutate({ id: user.id })}
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
                message={t('users:deleteModal.message', {
                  name: user.email,
                })}
                onConfirm={() => removeUser.mutate({ id: user.id })}
                confirmText={t('common:actions.delete')}
                confirmVariant="@dangerSecondary"
              >
                <MenuItem
                  icon={<Icon icon={LuTrash2} fontSize="lg" color="gray.400" />}
                >
                  {t('common:actions.delete')}
                </MenuItem>
              </ConfirmModal>
            </>
          )}
        </MenuList>
      </Portal>
    </Menu>
  );
};

import React from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  CloseButton,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuProps,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuEdit, LuEye, LuTrash2 } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { ActionsButton } from '@/components/ActionsButton';
import { Icon } from '@/components/Icons';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { Repository } from '@/features/repositories/schema';
import { useRepositoryRemove } from '@/features/repositories/service';

export type RepositoryActionProps = Omit<MenuProps, 'children'> & {
  repository: Repository;
};

export const RepositoryActions = ({
  repository,
  ...rest
}: RepositoryActionProps) => {
  const { t } = useTranslation(['common', 'repositories']);

  const confirmDeleteModal = useDisclosure();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const repositoryRemove = useRepositoryRemove({
    onSuccess: (_, { name }) => {
      toastSuccess({
        title: t('repositories:feedbacks.deleteRepositorySuccess.title'),
        description: t(
          'repositories:feedbacks.deleteRepositorySuccess.description',
          {
            name,
          }
        ),
      });
    },
    onError: (_, { name }) => {
      toastError({
        title: t('repositories:feedbacks.deleteRepositoryError.title'),
        description: t(
          'repositories:feedbacks.deleteRepositoryError.description',
          {
            name,
          }
        ),
      });
    },
  });
  const removeRepository = () => repositoryRemove.mutate(repository);
  const isRemovalLoading = repositoryRemove.isLoading;

  return (
    <>
      <Menu isLazy placement="left-start" {...rest}>
        <MenuButton as={ActionsButton} isLoading={isRemovalLoading} />
        <Portal>
          <MenuList>
            <MenuItem
              as={Link}
              to={`/repositories/${repository.id}`}
              icon={<Icon icon={LuEye} fontSize="lg" color="gray.400" />}
            >
              {t('repositories:list.actions.view')}
            </MenuItem>
            <MenuItem
              as={Link}
              to={`/repositories/${repository.id}/update`}
              icon={<Icon icon={LuEdit} fontSize="lg" color="gray.400" />}
            >
              {t('common:actions.edit')}
            </MenuItem>
            <MenuItem
              icon={<Icon icon={LuTrash2} fontSize="lg" color="gray.400" />}
              onClick={confirmDeleteModal.onOpen}
            >
              {t('common:actions.delete')}
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
      <Modal
        isOpen={confirmDeleteModal.isOpen}
        onClose={confirmDeleteModal.onClose}
      >
        <Portal>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Box flex={1}>{t('repositories:deleteModal.title')}</Box>
                <CloseButton onClick={confirmDeleteModal.onClose} />
              </HStack>
            </ModalHeader>
            <ModalBody fontSize="sm">
              {t('repositories:deleteModal.message', { name: repository.name })}
            </ModalBody>
            <ModalFooter>
              <ButtonGroup justifyContent="space-between" w="full">
                <Button onClick={confirmDeleteModal.onClose}>
                  {t('common:actions.cancel')}
                </Button>
                <Button
                  variant="@danger"
                  onClick={() => {
                    removeRepository();
                    confirmDeleteModal.onClose();
                  }}
                >
                  {t('common:actions.delete')}
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Portal>
      </Modal>
    </>
  );
};

import React, { FC } from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';

interface IConfirmModal {
  onConfirm: any;
  onCancel: any;
  title: string;
  children: any;
  isOpen: boolean;
  onClose: any;
}

export const ConfirmModal: FC<IConfirmModal> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  children,
}) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button
            onClick={onCancel}
            variant="outline"
            display={{ base: 'none', sm: 'flex' }}
            colorScheme="brand"
            size="md"
            mr={2}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            display={{ base: 'none', sm: 'flex' }}
            colorScheme="error"
            leftIcon={<FiTrash2 />}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

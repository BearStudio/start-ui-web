import React from 'react';
import { LoginForm } from '@/app/auth/LoginForm';
import { Modal, ModalOverlay, ModalContent, ModalBody } from '@chakra-ui/core';
import { useQueryCache } from 'react-query';

export const LoginModal = ({ isOpen = false, onClose = () => {} }) => {
  const queryCache = useQueryCache();
  const onLogin = () => {
    queryCache.refetchQueries();
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody p="6">
          <LoginForm onSuccess={onLogin} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

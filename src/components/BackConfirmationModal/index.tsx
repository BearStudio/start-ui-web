import React from 'react';

import {
  Button,
  ButtonGroup,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

export const BackConformationModal = ({ isOpen, onClose }) => {
  const history = useHistory();

  const onConfirm = () => history.goBack();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay style={{ backdropFilter: 'blur(6px)' }}>
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p="6">
            <Heading size="lg">Do you want to go back ?</Heading>
            <Text mt="3">Your unsaved changes will be lost.</Text>
          </ModalBody>
          <ModalFooter p="6">
            <ButtonGroup>
              <Button onClick={onClose}>Cancel</Button>
              <Button onClick={onConfirm} colorScheme="brand">
                Confirm
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

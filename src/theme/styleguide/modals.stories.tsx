import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';

export default {
  title: 'StyleGuide/Modals',
};

export const Default = () =>
  (() => {
    const modal = useDisclosure();

    return (
      <>
        <Button onClick={modal.onOpen}>Open Modal</Button>
        <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corporis
              ullam esse aperiam, vitae aliquam ipsum sapiente possimus nostrum,
              temporibus facere consequuntur magnam error dicta consectetur
              asperiores tempore omnis quasi aliquid.
            </ModalBody>
            <ModalFooter>
              <ButtonGroup justifyContent="space-between" w="full">
                <Button onClick={modal.onClose}>Cancel</Button>
                <Button variant="@primary" onClick={modal.onClose}>
                  Action
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  })();

export const WithoutHeader = () =>
  (() => {
    const modal = useDisclosure();

    return (
      <>
        <Button onClick={modal.onOpen}>Open Modal</Button>
        <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalBody>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corporis
              ullam esse aperiam, vitae aliquam ipsum sapiente possimus nostrum,
              temporibus facere consequuntur magnam error dicta consectetur
              asperiores tempore omnis quasi aliquid.
            </ModalBody>
            <ModalFooter>
              <ButtonGroup justifyContent="space-between" w="full">
                <Button onClick={modal.onClose}>Cancel</Button>
                <Button variant="@primary" onClick={modal.onClose}>
                  Action
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  })();

export const WithoutBody = () =>
  (() => {
    const modal = useDisclosure();

    return (
      <>
        <Button onClick={modal.onOpen}>Open Modal</Button>
        <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalFooter>
              <ButtonGroup justifyContent="space-between" w="full">
                <Button onClick={modal.onClose}>Cancel</Button>
                <Button variant="@primary" onClick={modal.onClose}>
                  Action
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  })();

export const WithoutFooter = () =>
  (() => {
    const modal = useDisclosure();

    return (
      <>
        <Button onClick={modal.onOpen}>Open Modal</Button>
        <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corporis
              ullam esse aperiam, vitae aliquam ipsum sapiente possimus nostrum,
              temporibus facere consequuntur magnam error dicta consectetur
              asperiores tempore omnis quasi aliquid.
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  })();

export const BodyOnly = () =>
  (() => {
    const modal = useDisclosure();

    return (
      <>
        <Button onClick={modal.onOpen}>Open Modal</Button>
        <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corporis
              ullam esse aperiam, vitae aliquam ipsum sapiente possimus nostrum,
              temporibus facere consequuntur magnam error dicta consectetur
              asperiores tempore omnis quasi aliquid.
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  })();

export const Full = () =>
  (() => {
    const modal = useDisclosure();

    return (
      <>
        <Button onClick={modal.onOpen}>Open Modal</Button>
        <Modal isOpen={modal.isOpen} onClose={modal.onClose} size="full">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corporis
              ullam esse aperiam, vitae aliquam ipsum sapiente possimus nostrum,
              temporibus facere consequuntur magnam error dicta consectetur
              asperiores tempore omnis quasi aliquid.
            </ModalBody>
            <ModalFooter>
              <ButtonGroup justifyContent="space-between" w="full">
                <Button onClick={modal.onClose}>Cancel</Button>
                <Button variant="@primary" onClick={modal.onClose}>
                  Action
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  })();

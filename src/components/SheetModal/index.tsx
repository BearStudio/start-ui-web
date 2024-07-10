import { ComponentProps } from 'react';

import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react';
import { Sheet } from 'react-modal-sheet';

export type SheetModalProps = Pick<
  ComponentProps<typeof Sheet>,
  'isOpen' | 'onClose' | 'children'
> & { size?: ModalProps['size'] };
export const SheetModal = (props: SheetModalProps) => {
  return (
    <>
      <Box
        as={Sheet}
        __css={{
          '.react-modal-sheet-backdrop': {
            display: { base: 'flex', sm: 'none !important' },
            backdropFilter: 'blur(4px)',
            background: 'rgba(0,0,0,0.4) !important',
          },
          '.react-modal-sheet-container': {
            display: { base: 'flex', sm: 'none !important' },
            background: 'white !important',
          },
          // '.react-modal-sheet-header': {},
          // '.react-modal-sheet-drag-indicator': {},
          '.react-modal-sheet-content': {
            px: 4,
            pb: 12,
          },
          _dark: {
            '.react-modal-sheet-container': {
              background: 'gray.800 !important',
            },
          },
        }}
        isOpen={props.isOpen}
        onClose={props.onClose}
        detent="content-height"
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>{props.children}</Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Box>
      <Modal
        size={props.size ?? 'xs'}
        isOpen={props.isOpen}
        onClose={props.onClose}
      >
        <ModalOverlay display={{ base: 'none', sm: 'flex' }} />
        <ModalContent display={{ base: 'none', sm: 'flex' }}>
          <ModalCloseButton />
          <ModalBody>{props.children}</ModalBody>
        </ModalContent>
      </Modal>{' '}
    </>
  );
};

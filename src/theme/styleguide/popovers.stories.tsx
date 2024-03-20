import {
  Button,
  ButtonGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react';

export default {
  title: 'StyleGuide/Popovers',
};

export const Default = () => (
  <Popover>
    <PopoverTrigger>
      <Button>Trigger</Button>
    </PopoverTrigger>
    <Portal>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Confirmation!</PopoverHeader>
        <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
        <PopoverFooter>
          <ButtonGroup size="sm" justifyContent="space-between" w="full">
            <Button>Cancel</Button>
            <Button variant="@primary">Action</Button>
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Portal>
  </Popover>
);

export const WithoutHeader = () => (
  <Popover>
    <PopoverTrigger>
      <Button>Trigger</Button>
    </PopoverTrigger>
    <Portal>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
        <PopoverFooter>
          <ButtonGroup size="sm" justifyContent="space-between" w="full">
            <Button>Cancel</Button>
            <Button variant="@primary">Action</Button>
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Portal>
  </Popover>
);

export const WithoutBody = () => (
  <Popover>
    <PopoverTrigger>
      <Button>Trigger</Button>
    </PopoverTrigger>
    <Portal>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Confirmation!</PopoverHeader>
        <PopoverFooter>
          <ButtonGroup size="sm" justifyContent="space-between" w="full">
            <Button>Cancel</Button>
            <Button variant="@primary">Action</Button>
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Portal>
  </Popover>
);

export const WithoutFooter = () => (
  <Popover>
    <PopoverTrigger>
      <Button>Trigger</Button>
    </PopoverTrigger>
    <Portal>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Confirmation!</PopoverHeader>
        <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
      </PopoverContent>
    </Portal>
  </Popover>
);

export const BodyOnly = () => (
  <Popover>
    <PopoverTrigger>
      <Button>Trigger</Button>
    </PopoverTrigger>
    <Portal>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
      </PopoverContent>
    </Portal>
  </Popover>
);

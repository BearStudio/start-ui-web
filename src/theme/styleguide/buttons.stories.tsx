import { Button, ButtonGroup, IconButton } from '@chakra-ui/react';
import { LuMinus, LuPlus } from 'react-icons/lu';

export default {
  title: 'StyleGuide/Buttons',
};

export const Default = () => (
  <ButtonGroup>
    <Button>Default Button</Button>
    <Button isLoading loadingText="Processing...">
      Button
    </Button>
    <IconButton icon={<LuPlus />} aria-label="Add" />
    <Button isDisabled>Button</Button>
  </ButtonGroup>
);
export const Primary = () => (
  <ButtonGroup>
    <Button variant="@primary">Primary Button</Button>
    <Button variant="@primary" isLoading loadingText="Processing...">
      Button
    </Button>
    <IconButton variant="@primary" icon={<LuPlus />} aria-label="Add" />
    <Button variant="@primary" isDisabled>
      Button
    </Button>
  </ButtonGroup>
);

export const Secondary = () => (
  <ButtonGroup>
    <Button variant="@secondary">Secondary Button</Button>
    <Button variant="@secondary" isLoading loadingText="Processing...">
      Button
    </Button>
    <IconButton variant="@secondary" icon={<LuPlus />} aria-label="Add" />
    <Button variant="@secondary" isDisabled>
      Button
    </Button>
  </ButtonGroup>
);
export const DangerPrimary = () => (
  <ButtonGroup>
    <Button variant="@dangerPrimary">Danger Primary Button</Button>
    <Button variant="@dangerPrimary" isLoading loadingText="Processing...">
      Button
    </Button>
    <IconButton
      variant="@dangerPrimary"
      icon={<LuMinus />}
      aria-label="Remove"
    />
    <Button variant="@dangerPrimary" isDisabled>
      Button
    </Button>
  </ButtonGroup>
);

export const DangerSecondary = () => (
  <ButtonGroup>
    <Button variant="@dangerSecondary">Danger Secondary Button</Button>
    <Button variant="@dangerSecondary" isLoading loadingText="Processing...">
      Button
    </Button>
    <IconButton
      variant="@dangerSecondary"
      icon={<LuMinus />}
      aria-label="Remove"
    />
    <Button variant="@dangerSecondary" isDisabled>
      Button
    </Button>
  </ButtonGroup>
);

export const Link = () => (
  <ButtonGroup>
    <Button variant="link">Link Button</Button>
    <Button variant="link" isLoading loadingText="Processing...">
      Button
    </Button>
    <IconButton variant="link" icon={<LuMinus />} aria-label="Remove" />
    <Button variant="link" isDisabled>
      Button
    </Button>
  </ButtonGroup>
);

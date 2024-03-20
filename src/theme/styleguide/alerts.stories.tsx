import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Stack,
} from '@chakra-ui/react';

export default {
  title: 'StyleGuide/Alerts',
};

export const Default = () => (
  <Stack>
    <Alert>
      <AlertDescription>Description</AlertDescription>
    </Alert>
    <Alert>
      <AlertTitle>Title</AlertTitle>
    </Alert>
    <Alert>
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>Description</AlertDescription>
    </Alert>
    <Alert>
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Beatae odio
        distinctio eos sequi, voluptates sit voluptas fuga perspiciatis nostrum
        excepturi cum expedita itaque in assumenda, sed voluptatum non
        accusantium enim.
      </AlertDescription>
    </Alert>
    <Alert>
      <AlertIcon />
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Beatae odio
        distinctio eos sequi, voluptates sit voluptas fuga perspiciatis nostrum
        excepturi cum expedita itaque in assumenda, sed voluptatum non
        accusantium enim.
      </AlertDescription>
    </Alert>
    <Alert>
      <AlertIcon />
      <AlertTitle>Title</AlertTitle>
    </Alert>
  </Stack>
);

export const Success = () => (
  <Alert status="success">
    <AlertIcon />
    <AlertTitle>Success!</AlertTitle>
    <AlertDescription>Data uploaded to the server. Fire on!</AlertDescription>
  </Alert>
);

export const Warning = () => (
  <Alert status="warning">
    <AlertIcon />
    <AlertTitle>Warning!</AlertTitle>
    <AlertDescription>
      Seems your account is about expire, upgrade now.
    </AlertDescription>
  </Alert>
);

export const Error = () => (
  <Alert status="error">
    <AlertIcon />
    <AlertTitle>Your browser is outdated!</AlertTitle>
    <AlertDescription>Your Chakra experience may be degraded.</AlertDescription>
  </Alert>
);

export const Info = () => (
  <Alert status="info">
    <AlertIcon />
    <AlertTitle>Info</AlertTitle>
    <AlertDescription>
      Chakra is going live on August 30th. Get ready!
    </AlertDescription>
  </Alert>
);

export const Loading = () => (
  <Alert status="loading">
    <AlertIcon />
    <AlertTitle>Processing</AlertTitle>
    <AlertDescription>We are validating your order...</AlertDescription>
  </Alert>
);

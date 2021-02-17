import React from 'react';

import { Button, Stack, Center, Heading, Text } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

export const Error403 = () => {
  const history = useHistory();
  return (
    <Center flex="1" p="8">
      <Stack align="center" textAlign="center">
        <Heading>Error 403</Heading>
        <Text color="gray.600">Sorry, you can't access this page.</Text>
        <Button onClick={() => history.goBack()}>Go Back</Button>
      </Stack>
    </Center>
  );
};

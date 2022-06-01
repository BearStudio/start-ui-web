import React from 'react';

import { Button, Stack, Text } from '@chakra-ui/react';
import { Route, Routes } from 'react-router-dom';

import { SmartNavigateLink, useSmartNavigate } from '.';

export default {
  title: 'Router/SmartNavigate',
};

const Page = () => {
  const { smartGoBack } = useSmartNavigate();

  return <Button onClick={() => smartGoBack('/')}>Go back</Button>;
};

export const Default = () => {
  const { smartNavigate } = useSmartNavigate();

  return (
    <>
      <Text>
        Behavior is not demonstrable in Storybook, but goBack works even if we
        open links in new tab
      </Text>
      <Routes>
        <Route
          path="/"
          element={
            <Stack>
              <Button as={SmartNavigateLink} to="/page">
                Navigate with SmartNavigateLink component
              </Button>
              <Button onClick={() => smartNavigate('/page')}>
                Navigate with smartNavigate() function
              </Button>
            </Stack>
          }
        />
        <Route path="/page" element={<Page />} />
      </Routes>
    </>
  );
};

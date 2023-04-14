import {
  Button,
  ButtonGroup,
  ListItem,
  OrderedList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { useGoBack } from '@/spa/router/useGoBack';

export default {
  title: 'App Routing/useGoBack',
};

export const Default = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  return (
    <Stack>
      <OrderedList>
        <ListItem>Go to next Page</ListItem>
        <ListItem>Go back</ListItem>
      </OrderedList>
      <Text>
        In this case, both buttons works and redirect to previous page
      </Text>
      <Routes>
        <Route
          path="/"
          element={
            <ButtonGroup alignItems="center">
              <Text fontWeight="bold">Home</Text>
              <Button onClick={() => navigate('/next')}>Go to next page</Button>
            </ButtonGroup>
          }
        />
        <Route
          path="/next"
          element={
            <ButtonGroup alignItems="center">
              <Text fontWeight="bold">Next page</Text>
              <Button onClick={() => goBack()}>Smart go back</Button>
              <Button onClick={() => navigate(-1)}>Classic go back</Button>
            </ButtonGroup>
          }
        />
      </Routes>
    </Stack>
  );
};

export const FromOutside = () => {
  const navigate = useNavigate();
  const goBack = useGoBack('previous');
  return (
    <Stack>
      <OrderedList>
        <ListItem>You arrive directly on next page</ListItem>
        <ListItem>Try to go back with classic go back</ListItem>
        <ListItem>Go back with smart go back</ListItem>
      </OrderedList>
      <Text>
        In this case, classic go back does not works because storybook router
        does not have previous page. On application case, go back redirect to
        previous browser page, even if it is outside the app
      </Text>
      <Routes>
        <Route path="/" element={<Navigate to="/next" replace />} />
        <Route
          path="/previous"
          element={
            <ButtonGroup alignItems="center">
              <Text fontWeight="bold">Previous</Text>
              <Button onClick={() => navigate('/next')}>Go to next page</Button>
            </ButtonGroup>
          }
        />
        <Route
          path="/next"
          element={
            <ButtonGroup alignItems="center">
              <Text fontWeight="bold">Next</Text>
              <Button onClick={() => goBack()}>Smart go back</Button>
              <Button onClick={() => navigate(-1)}>Classic go back</Button>
            </ButtonGroup>
          }
        />
      </Routes>
    </Stack>
  );
};

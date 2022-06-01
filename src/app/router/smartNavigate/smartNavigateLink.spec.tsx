import { Button, Stack, Text } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { SmartNavigateLink } from '@/app/router/smartNavigate/SmartNavigateLink';
import { SmartNavigateState } from '@/app/router/smartNavigate/useSmartNavigate';

const App = () => {
  const location = useLocation();
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Stack>
            <Text>Home</Text>
            <Button as={SmartNavigateLink} to="/test">
              Navigate
            </Button>
          </Stack>
        }
      />
      <Route
        path="/test"
        element={
          <Stack>
            <Text>Test</Text>
            <Text>State - From : {(location.state as SmartNavigateState)?.from}</Text>
          </Stack>
        }
      />
    </Routes>
  );
};

test('SmartNavigateLink', async () => {
  render(<App />, { wrapper: MemoryRouter });

  expect(screen.getByText(/Home/i)).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByText(/Navigate/i));

  expect(screen.getByText(/Test/i)).toBeInTheDocument();
  expect(screen.getByText(/State - From : \//i)).toBeInTheDocument();
});

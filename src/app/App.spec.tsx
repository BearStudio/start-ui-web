import { App } from '@/app/App';
import { APP_BASENAME } from '@/constants/routing';
import { act, render, screen } from '@/test/utils';

beforeEach(() => {
  window.history.pushState({}, '', `/${APP_BASENAME}`);
});

test('Mount App without errors', async () => {
  await act(async () => {
    render(<App />);
  });
  expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
});

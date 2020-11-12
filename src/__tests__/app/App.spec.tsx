import { render, screen, act } from '@/test/utils';
import { App } from '@/app/App';

test('App', async () => {
  await act(async () => render(<App />));
  expect(screen.queryByText(/error/i)).toBeNull();
  expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
});

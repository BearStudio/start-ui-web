import { App } from '@/app/App';

beforeEach(() => {
  window.history.pushState({}, '', '/app');
});

describe('App', () => {
  it.skip('Mount App without errors', () => {
    cy.mount(<App />);
    cy.findByTestId('login-page-heading').should('contain.text', 'Log In');
  });
});

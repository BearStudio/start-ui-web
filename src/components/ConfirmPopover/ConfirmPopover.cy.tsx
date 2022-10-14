import { Button } from '@chakra-ui/react';

import { ConfirmPopover } from '.';

describe('ComfirmPopover', () => {
  it('display a button with popin to confirm action', () => {
    const onConfirmSpy = cy.spy().as('onConfirmSpy');
    cy.mount(
      <ConfirmPopover onConfirm={onConfirmSpy}>
        <Button>Trigger Popover</Button>
      </ConfirmPopover>
    );

    cy.findByRole('button').click();
    cy.findByRole('dialog', { name: 'Are you sure?' }).should('be.visible');

    cy.findByText('Confirm').click();
    cy.findByRole('dialog', { name: 'Are you sure?' }).should('not.exist');
    cy.get('@onConfirmSpy').should('have.been.called');
  });
});

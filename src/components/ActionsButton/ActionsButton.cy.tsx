import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';

import { ActionsButton } from '@/components/ActionsButton';

describe('ActionsButton', () => {
  const actionsButtonSelector = '[data-test="actions-button"]';
  const menuListSelector = '[data-test="menu-list"]';

  it('should display an accessible clickable icon', () => {
    cy.mount(
      <Menu>
        <MenuButton as={ActionsButton} />
        <MenuList data-test="menu-list">
          <MenuItem>Menu Item 1</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </MenuList>
      </Menu>
    );

    cy.get(actionsButtonSelector)
      .should('have.attr', 'aria-label', 'Actions')
      .children('svg');

    cy.get(menuListSelector).should('not.be.visible');
    cy.get(actionsButtonSelector).should('not.be.disabled').click();
    cy.get(menuListSelector).should('be.visible');
  });

  it('supports a "label" prop to set the aria-label', () => {
    cy.mount(
      <Menu>
        <MenuButton as={ActionsButton} label="Custom label" />
      </Menu>
    );

    cy.get(actionsButtonSelector).should(
      'have.attr',
      'aria-label',
      'Custom label'
    );
  });
});

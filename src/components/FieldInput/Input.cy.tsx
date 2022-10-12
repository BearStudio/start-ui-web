import { Button } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldInput } from '@/components/FieldInput';

const WrapperComponent = ({ onSubmit }: any) => {
  const form = useForm();

  console.log({ isValid: form.isValid });

  const handleSubmit = (values: any) => {
    console.log('onSubmit', { values, form });
    onSubmit(values);
  };

  return (
    <Formiz autoForm onValidSubmit={handleSubmit} connect={form}>
      <FieldInput name="input" label="My Input" required="Required" />
      <Button type="submit">Submit</Button>
    </Formiz>
  );
};

describe('FieldInput', () => {
  it('supports a "label" prop to set the aria-label', () => {
    const handleValidSubmit = cy.spy().as('handleValidSubmit');

    cy.mount(<WrapperComponent onSubmit={handleValidSubmit} />);

    cy.get('button').click();
    cy.get('@handleValidSubmit').should('not.have.been.called');
  });
});

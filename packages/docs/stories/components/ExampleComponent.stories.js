import React from 'react';
import { ExampleComponent } from 'lib-ui';

export default {
  title: 'JS Stories',
};

export const Default = () => (
  <ExampleComponent>
    ExampleComponent
  </ExampleComponent>
);

export const Variants = () => (
  <ExampleComponent variant="light">
    ExampleComponent
  </ExampleComponent>
);

export const VariantColors = () => (
  <>
    <ExampleComponent variantColor="brand">
      ExampleComponent
    </ExampleComponent>
    <ExampleComponent variantColor="blue">
      ExampleComponent
    </ExampleComponent>
  </>
);

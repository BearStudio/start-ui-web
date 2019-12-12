import React from "react";
import {
  ThemeProvider,
  CSSReset,
} from "@chakra-ui/core";
import { theme, ExampleComponent } from 'lib-ui';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />

      <ExampleComponent>
        ExampleComponent
      </ExampleComponent>
      <ExampleComponent variant="light">
        ExampleComponent (light)
      </ExampleComponent>

      <ExampleComponent variantColor="blue">
        ExampleComponent
      </ExampleComponent>
      <ExampleComponent variant="light" variantColor="blue">
        ExampleComponent (light)
      </ExampleComponent>

      <ExampleComponent variantColor="brand">
        ExampleComponent
      </ExampleComponent>
      <ExampleComponent variant="light" variantColor="brand">
        ExampleComponent (light)
      </ExampleComponent>
    </ThemeProvider>
  );
}

export default App;

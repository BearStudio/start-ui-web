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

      <ExampleComponent variant="primary">
        ExampleComponent (primary)
      </ExampleComponent>
      <ExampleComponent variant="secondary">
        ExampleComponent (secondary)
      </ExampleComponent>
    </ThemeProvider>
  );
}

export default App;

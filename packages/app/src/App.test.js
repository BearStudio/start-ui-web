import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test("renders Chrakra UI in App", () => {
  const { getByText } = render(<App />);
  const element = getByText(/Chakra UI/i);
  expect(element).toBeInTheDocument();
});

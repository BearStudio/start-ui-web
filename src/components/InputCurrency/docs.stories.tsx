import React, { useState } from 'react';

import { Stack, Code } from '@chakra-ui/react';

import { InputCurrency } from '.';

export default {
  title: 'Components/InputCurrency',
};

export const Default = () => {
  const [value, setValue] = useState(1020.2);
  return (
    <Stack>
      <InputCurrency value={value} onChange={setValue} />
      <InputCurrency value={value} onChange={setValue} currency={null} />
      <Code>{value}</Code>
    </Stack>
  );
};

export const Currency = () => {
  const [value, setValue] = useState(1020.2);
  return (
    <Stack>
      <InputCurrency value={value} onChange={setValue} currency="EUR" />
      <InputCurrency value={value} onChange={setValue} currency="USD" />
      <InputCurrency value={value} onChange={setValue} currency="GBP" />
      <Code>{value}</Code>
    </Stack>
  );
};

export const LocaleFR = () => {
  const [value, setValue] = useState(1020.2);
  return (
    <Stack>
      <InputCurrency value={value} onChange={setValue} locale="fr" />
      <InputCurrency
        value={value}
        onChange={setValue}
        locale="fr"
        currency="EUR"
      />
      <InputCurrency
        value={value}
        onChange={setValue}
        locale="fr"
        currency="USD"
      />
      <InputCurrency
        value={value}
        onChange={setValue}
        locale="fr"
        currency="GBP"
      />
      <Code>{value}</Code>
    </Stack>
  );
};

export const defaultValue = () => (
  <Stack>
    <InputCurrency defaultValue={10} />
    <InputCurrency defaultValue={10} currency="USD" />
    <InputCurrency defaultValue={10} currency={null} />
  </Stack>
);

export const Placeholder = () => (
  <Stack>
    <InputCurrency placeholder={10} />
    <InputCurrency placeholder={10} currency="USD" />
    <InputCurrency placeholder="Text placeholder" />
  </Stack>
);

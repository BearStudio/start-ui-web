import React, { useState } from 'react';

import { Stack, Code } from '@chakra-ui/layout';

import { InputCurrency } from '.';

export default {
  title: 'Components/InputCurrency',
};

export const Default = () => {
  const [value, setValue] = useState(1020.2);
  return (
    <Stack>
      <InputCurrency value={value} onChange={setValue} />
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

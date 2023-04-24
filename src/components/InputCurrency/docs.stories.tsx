import React, { useState } from 'react';

import { Code, Stack } from '@chakra-ui/react';

import { InputCurrency } from '.';

export default {
  title: 'Components/InputCurrency',
};

export const Default = () => {
  const [value, setValue] = useState<number | undefined>(1020.2);
  return (
    <Stack>
      <InputCurrency value={value} onChange={setValue} />
      <InputCurrency value={value} onChange={setValue} currency={null} />
      <Code>{value}</Code>
    </Stack>
  );
};

export const Currency = () => {
  const [value, setValue] = useState<number | undefined>(1020.2);
  return (
    <Stack>
      <InputCurrency
        value={value}
        onChange={(v) => setValue(v)}
        currency="EUR"
      />
      <InputCurrency
        value={value}
        onChange={(v) => setValue(v)}
        currency="USD"
      />
      <InputCurrency
        value={value}
        onChange={(v) => setValue(v)}
        currency="GBP"
      />
      <Code>{value}</Code>
    </Stack>
  );
};

export const LocaleFR = () => {
  const [value, setValue] = useState<number | undefined>(1020.2);
  return (
    <Stack>
      <InputCurrency value={value} onChange={(v) => setValue(v)} locale="fr" />
      <InputCurrency
        value={value}
        onChange={(v) => setValue(v)}
        locale="fr"
        currency="EUR"
      />
      <InputCurrency
        value={value}
        onChange={(v) => setValue(v)}
        locale="fr"
        currency="USD"
      />
      <InputCurrency
        value={value}
        onChange={(v) => setValue(v)}
        locale="fr"
        currency="GBP"
      />
      <Code>{value}</Code>
    </Stack>
  );
};

export const DefaultValue = () => (
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

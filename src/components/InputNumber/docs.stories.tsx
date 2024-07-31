import React, { useState } from 'react';

import { Code, Stack } from '@chakra-ui/react';

import { InputNumber } from '.';

export default {
  title: 'Components/InputNumber',
};

export const Default = () => {
  const [value, setValue] = useState<number | null>(201912.12);
  return (
    <Stack>
      <InputNumber value={value} onChange={setValue} />
      <InputNumber value={value} onChange={setValue} size="sm" />
      <InputNumber value={value} onChange={setValue} size="lg" />
      <Code>{value}</Code>
    </Stack>
  );
};

export const Suffix = () => (
  <Stack>
    <InputNumber placeholder="Kilograms" suffix=" kg" />
    <InputNumber placeholder="Kilograms" textAlign="right" suffix=" kg" />
  </Stack>
);

export const Precision = () => (
  <Stack>
    <InputNumber placeholder="Kilograms" precision={3} />
  </Stack>
);

export const Currency = () => {
  const [value, setValue] = useState<number | null>(201912.12);
  return (
    <Stack>
      <InputNumber value={value} onChange={(v) => setValue(v)} currency="EUR" />
      <InputNumber value={value} onChange={(v) => setValue(v)} currency="USD" />
      <InputNumber value={value} onChange={(v) => setValue(v)} currency="GBP" />
      <Code>{value}</Code>
    </Stack>
  );
};

export const LocaleFR = () => {
  const [value, setValue] = useState<number | null>(201912.12);
  return (
    <Stack>
      <InputNumber value={value} onChange={(v) => setValue(v)} locale="fr" />
      <InputNumber
        value={value}
        onChange={(v) => setValue(v)}
        locale="fr"
        currency="EUR"
      />
      <InputNumber
        value={value}
        onChange={(v) => setValue(v)}
        locale="fr"
        currency="USD"
      />
      <InputNumber
        value={value}
        onChange={(v) => setValue(v)}
        locale="fr"
        currency="GBP"
      />
      <Code>{value}</Code>
    </Stack>
  );
};

export const Placeholder = () => (
  <Stack>
    <InputNumber placeholder={10} />
    <InputNumber placeholder="Text placeholder" />
    <InputNumber placeholder={10} currency="USD" suffix="/t" />
    <InputNumber placeholder="Text placeholder" currency="USD" suffix="/t" />
  </Stack>
);

export const FixedDecimalScale = () => {
  return (
    <Stack>
      <InputNumber precision={2} fixedPrecision value={201912.12} />
      <InputNumber precision={2} fixedPrecision value={201912.1} />
    </Stack>
  );
};

export const WithMinMax = () => {
  const [value, setValue] = useState<number | null>(3);
  return (
    <Stack>
      <InputNumber value={value} onChange={setValue} min={0} max={4} />
      <Code>{value}</Code>
    </Stack>
  );
};

export const Step = () => {
  const [value, setValue] = useState<number | null>(0);
  return (
    <Stack>
      <InputNumber value={value} onChange={setValue} step={0.1} />
      <InputNumber value={value} onChange={setValue} step={0.5} bigStep={2} />
      <Code>{value}</Code>
    </Stack>
  );
};

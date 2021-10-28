import React from 'react';

import { Code, Stack } from '@chakra-ui/react';

import { TextCurrency } from '.';

export default {
  title: 'Components/TextCurrency',
};

export const Default = () => {
  const value = 1020.2;
  return (
    <Stack>
      <TextCurrency value={value} />
      <Code>{value}</Code>
    </Stack>
  );
};

export const Currency = () => {
  const value = 1020.2;
  return (
    <Stack>
      <TextCurrency value={value} currency="EUR" />
      <TextCurrency value={value} currency="USD" />
      <TextCurrency value={value} currency="GBP" />
      <Code>{value}</Code>
    </Stack>
  );
};

export const LocaleFR = () => {
  const value = 1020.2;
  return (
    <Stack>
      <TextCurrency value={value} locale="fr" />
      <TextCurrency value={value} locale="fr" currency="EUR" />
      <TextCurrency value={value} locale="fr" currency="USD" />
      <TextCurrency value={value} locale="fr" currency="GBP" />
      <Code>{value}</Code>
    </Stack>
  );
};

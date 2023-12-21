import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldCurrency } from './index';

export default {
  title: 'Fields/FieldCurrency',
};

export const Default = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldCurrency
          name="demo-currency"
          label="Currency"
          helper="This is an helper"
          required="Currency is required"
          placeholder={100}
          inputCurrencyProps={{ currency: 'EUR' }}
        />
        <FieldCurrency
          name="demo-currency-usd"
          label="Currency USD"
          helper="This is an helper"
          required="Currency is required"
          placeholder={100}
          inputCurrencyProps={{ currency: 'USD' }}
        />
        <FieldCurrency
          name="demo-currency-locale-fr"
          label="Currency locale FR"
          helper="This is an helper"
          required="Currency is required"
          placeholder={100}
          inputCurrencyProps={{ currency: 'EUR', locale: 'fr' }}
        />
        <FieldCurrency
          name="demo-currency-decimals-0"
          label="0 Decimals"
          helper="This is an helper"
          required="Currency is required"
          placeholder={100}
          inputCurrencyProps={{ decimals: 0 }}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

import React from 'react';

import { Formiz } from '@formiz/core';

import { FieldSelect } from '@/components';

const colors = [
  { label: 'Red', value: 'red' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Blue', value: 'blue' },
];

export default {
  title: 'Fields/FieldSelect',
};

export const Default = () => (
  <Formiz autoForm onChange={console.log}>
    <FieldSelect
      name="colors"
      label="Colors"
      placeholder="Placeholder"
      helper="This is an helper"
      required="Color is required"
      options={colors}
    />
  </Formiz>
);

export const Disabled = () => (
  <Formiz autoForm onChange={console.log}>
    <FieldSelect
      name="colors"
      label="Colors"
      placeholder="Placeholder"
      helper="This is an helper"
      required="Color is required"
      options={colors}
      isDisabled
	/>
  </Formiz>
);

export const DefaultValue = () => (
  <Formiz autoForm onChange={console.log}>
    <FieldSelect
      name="colors"
      label="Colors"
      placeholder="Placeholder"
      helper="This is an helper"
      required="Color is required"
      defaultValue={colors[0].value}
      options={colors}
      selectProps={{ isClearable: true }}
    />
  </Formiz>
);

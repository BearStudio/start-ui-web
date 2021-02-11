import React from 'react';

import { Editable } from '.';

export default {
  title: 'components/Editable',
  component: Editable,
};
export const Default = () => <Editable />;

export const UsageWithValue = () => <Editable value=" Start ui" />;

export const UsageWithTriggeredEvents = () => {
  const handleCancel = (value) => {
    console.log('Cancel', { value });
  };

  const handleSubmit = (value) => {
    console.log('Submit', { value });
  };

  const handleChange = (e) => {
    console.log('Change', { value: e.target.value });
  };

  return (
    <Editable
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onChange={handleChange}
    />
  );
};

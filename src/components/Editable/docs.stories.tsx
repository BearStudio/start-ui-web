import { useState } from 'react';

import { Editable } from '.';

export default {
  title: 'components/Editable',
};

export const Default = () => {
  const [text, setText] = useState('');

  const handleCancel = (value) => {
    console.log('Cancel', { value });
  };

  const handleSubmit = (value) => {
    console.log('Submit', { value });
    setText(value);
  };

  const handleChange = (e) => {
    console.log('Change', { value: e.target.value });
  };

  return (
    <Editable
      value={text}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onChange={handleChange}
    />
  );
};

export const UsageWithValue = () => <Editable value=" Start ui" />;

import { TextareaAutosize } from '.';

export default {
  title: 'components/TextareaAutosize',
};

export const Default = () => {
  const handleChange = (e) => {
    console.log('Change', { value: e.target.value });
  };

  return <TextareaAutosize onChange={handleChange} />;
};

export const UsageWithValue = () => <TextareaAutosize value=" Start ui" />;

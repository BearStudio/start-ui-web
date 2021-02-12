import { TextareaAutosize } from '.';

export default {
  title: 'components/TextareaAutosize',
  component: TextareaAutosize,
};
export const Default = () => <TextareaAutosize />;

export const UsageWithValue = () => <TextareaAutosize value=" Start ui" />;

export const UsageWithTriggeredEvents = () => {
  const handleChange = (e) => {
    console.log('Change', { value: e.target.value });
  };

  return <TextareaAutosize onChange={(event) => handleChange(event)} />;
};

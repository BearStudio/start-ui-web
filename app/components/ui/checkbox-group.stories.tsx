import { Meta } from '@storybook/react-vite';

import { Checkbox } from '@/components/ui/checkbox';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
export default {
  title: 'CheckboxGroup',
  component: CheckboxGroup,
} satisfies Meta<typeof CheckboxGroup>;

const astrobears = [
  { value: 'bearstrong', label: 'Bearstrong', disabled: false },
  { value: 'pawdrin', label: 'Buzz Pawdrin', disabled: false },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin', disabled: true },
] as const;

export const Default = () => {
  return (
    <CheckboxGroup>
      {astrobears.map((option) => (
        <Checkbox key={option.value} value={option.value}>
          {option.label}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};

export const DefaultValue = () => {
  return (
    <CheckboxGroup defaultValue={['bearstrong']}>
      {astrobears.map((option) => (
        <Checkbox key={option.value} value={option.value}>
          {option.label}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};

export const Disabled = () => {
  return (
    <CheckboxGroup disabled>
      {astrobears.map((option) => (
        <Checkbox key={option.value} value={option.value}>
          {option.label}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};

export const DisabledOption = () => {
  return (
    <CheckboxGroup>
      {astrobears.map((option) => (
        <Checkbox
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};

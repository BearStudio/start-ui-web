import { Checkbox } from '@/platform/components/ui/checkbox';
import { CheckboxGroup } from '@/platform/components/ui/checkbox-group';
const astrobears = [
  { value: 'bearstrong', label: 'Bearstrong', disabled: false },
  { value: 'pawdrin', label: 'Buzz Pawdrin', disabled: false },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin', disabled: true },
] as const;

const Default = () => {
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

const DefaultValue = () => {
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

const Disabled = () => {
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

const DisabledOption = () => {
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

export default {
  Default,
  DefaultValue,
  Disabled,
  DisabledOption,
};

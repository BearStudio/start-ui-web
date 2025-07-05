import { Meta } from '@storybook/react-vite';
import { useState } from 'react';

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

const nestedBears = [
  {
    label: 'Bear 1',
    value: 'bear-1',
    children: null,
  },
  {
    label: 'Bear 2',
    value: 'bear-2',
    children: null,
  },
  {
    label: 'Bear 3',
    value: 'bear-3',
    children: [
      {
        label: 'Little bear 1',
        value: 'little-bear-1',
      },
      {
        label: 'Little bear 2',
        value: 'little-bear-2',
      },
      {
        label: 'Little bear 3',
        value: 'little-bear-3',
      },
    ],
  },
] as const;

const bears = nestedBears.map((bear) => bear.value);
const littleBears = nestedBears[2].children.map((bear) => bear.value);
export const WithNestedGroups = () => {
  const [bearsValue, setBearsValue] = useState<string[]>([]);
  const [littleBearsValue, setLittleBearsValue] = useState<string[]>([]);

  return (
    <CheckboxGroup
      value={bearsValue}
      onValueChange={(value) => {
        if (value.includes('bear-3')) {
          setLittleBearsValue(littleBears);
        } else if (littleBearsValue.length === littleBears.length) {
          setLittleBearsValue([]);
        }
        setBearsValue(value);
      }}
      allValues={bears}
      defaultValue={[]}
    >
      <Checkbox parent>Astrobears</Checkbox>
      <div className="pl-4">
        {nestedBears.map((option) => {
          if (!option.children) {
            return (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            );
          }

          return (
            <CheckboxGroup
              key={option.value}
              value={littleBearsValue}
              onValueChange={(value) => {
                if (value.length === littleBears.length) {
                  setBearsValue((prev) =>
                    Array.from(new Set([...prev, 'bear-3']))
                  );
                } else {
                  setBearsValue((prev) => prev.filter((v) => v !== 'bear-3'));
                }
                setLittleBearsValue(value);
              }}
              allValues={option.children.map((bear) => bear.value)}
              defaultValue={[]}
            >
              <Checkbox parent>{option.label}</Checkbox>
              <div className="pl-4">
                {option.children.map((nestedOption) => {
                  return (
                    <Checkbox
                      key={nestedOption.value}
                      value={nestedOption.value}
                    >
                      {nestedOption.label}
                    </Checkbox>
                  );
                })}
              </div>
            </CheckboxGroup>
          );
        })}
      </div>
    </CheckboxGroup>
  );
};

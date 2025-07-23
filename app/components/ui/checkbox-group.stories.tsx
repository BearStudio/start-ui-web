import { Meta } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { useCheckboxGroup } from '@/components/ui/checkbox.utils';
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

export const ParentCheckbox = () => {
  const [value, setValue] = useState<string[]>([]);

  return (
    <CheckboxGroup
      value={value}
      onValueChange={setValue}
      allValues={astrobears.map((bear) => bear.value)}
    >
      <Checkbox name="astrobears" parent>
        Astrobears
      </Checkbox>
      <div className="flex flex-col gap-1 pl-4">
        {astrobears.map((option) => (
          <Checkbox key={option.value} value={option.value}>
            {option.label}
          </Checkbox>
        ))}
      </div>
    </CheckboxGroup>
  );
};

const nestedBears = [
  { value: 'bearstrong', label: 'Bearstrong', children: undefined },
  {
    value: 'pawdrin',
    label: 'Buzz Pawdrin',
    children: [
      { value: 'mini-pawdrin-1', label: 'Mini pawdrin 1' },
      { value: 'mini-pawdrin-2', label: 'Mini pawdrin 2' },
    ],
  },
  {
    value: 'grizzlyrin',
    label: 'Yuri Grizzlyrin',
    children: [
      { value: 'mini-grizzlyrin-1', label: 'Mini grizzlyrin 1' },
      { value: 'mini-grizzlyrin-2', label: 'Mini grizzlyrin 2' },
    ],
  },
];

export const Nested = () => {
  return (
    <CheckboxGroup
      groups={['grizzlyrin', 'pawdrin']}
      checkAll={{ label: 'Astrobears' }}
      options={nestedBears}
    />
  );
};

export const NestedWithCustomLogic = () => {
  const {
    main: { indeterminate, ...main },
    nested,
  } = useCheckboxGroup(nestedBears, {
    groups: ['grizzlyrin', 'pawdrin'],
    mainDefaultValue: [],
    nestedDefaultValue: {
      grizzlyrin: [],
      pawdrin: ['mini-pawdrin-1'],
    },
  });

  return (
    <>
      <CheckboxGroup {...main}>
        <Checkbox name="astrobears" parent indeterminate={indeterminate}>
          Astrobears
        </Checkbox>
        <div className="space-y-1 pl-4">
          {nestedBears.map((bear) => {
            if (!bear.children) {
              return (
                <Checkbox key={bear.value} value={bear.value}>
                  {bear.label}
                </Checkbox>
              );
            }

            return (
              <CheckboxGroup key={bear.value} {...nested[bear.value]}>
                <Checkbox value={bear.value} parent>
                  {bear.label}
                </Checkbox>
                <div className="space-y-1 pl-4">
                  {bear.children.map((bear) => (
                    <Checkbox key={bear.value} value={bear.value}>
                      {bear.label}
                    </Checkbox>
                  ))}
                </div>
              </CheckboxGroup>
            );
          })}
        </div>
      </CheckboxGroup>
      [{main.value.join(', ')}] <br />[{nested['grizzlyrin']?.value?.join(', ')}
      ]
    </>
  );
};

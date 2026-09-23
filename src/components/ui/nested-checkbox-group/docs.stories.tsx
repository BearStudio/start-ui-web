import { Meta } from '@storybook/react-vite';
import React from 'react';

import { Button } from '@/components/ui/button';
import { NestedCheckbox as Checkbox } from '@/components/ui/nested-checkbox-group/nested-checkbox';
import { NestedCheckboxGroup as CheckboxGroup } from '@/components/ui/nested-checkbox-group/nested-checkbox-group';

export default {
  title: 'NestedCheckboxGroup',
  component: CheckboxGroup,
} satisfies Meta<typeof CheckboxGroup>;

const astrobears = [
  { value: 'bearstrong', label: 'Bearstrong', children: undefined },
  { value: 'pawdrin', label: 'Buzz Pawdrin', children: undefined },
  {
    value: 'grizzlyrin',
    label: 'Yuri Grizzlyrin',
    disabled: true,
    children: [
      {
        value: 'mini-grizzlyrin-1',
        label: 'Mini Grizzlyrin 1',
      },
      {
        value: 'mini-grizzlyrin-2',
        label: 'Mini Grizzlyrin 2',
      },
    ],
  },
] as const;

export const Default = () => {
  return (
    <CheckboxGroup>
      <Checkbox value="astrobears">Astrobears</Checkbox>
      <div className="flex flex-col gap-2 pl-4">
        <Checkbox value="bearstrong" parent="astrobears">
          Bearstrong
        </Checkbox>
        <Checkbox value="pawdrin" parent="astrobears">
          Buzz Pawdrin
        </Checkbox>
        <Checkbox value="grizzlyrin" parent="astrobears">
          Yuri Grizzlyrin
        </Checkbox>
        <div className="flex flex-col gap-2 pl-4">
          <Checkbox value="mini-grizzlyrin-1" parent="grizzlyrin">
            Mini Grizzlyrin 1
          </Checkbox>
          <Checkbox value="mini-grizzlyrin-2" parent="grizzlyrin">
            Mini Grizzlyrin 2
          </Checkbox>
        </div>
      </div>
    </CheckboxGroup>
  );
};

export const DefaultValue = () => {
  return (
    <CheckboxGroup>
      <Checkbox value="astrobears">Astrobears</Checkbox>
      <div className="flex flex-col gap-2 pl-4">
        <Checkbox value="bearstrong" parent="astrobears">
          Bearstrong
        </Checkbox>
        <Checkbox value="pawdrin" parent="astrobears">
          Buzz Pawdrin
        </Checkbox>
        <Checkbox value="grizzlyrin" parent="astrobears" defaultChecked>
          Yuri Grizzlyrin
        </Checkbox>
        <div className="flex flex-col gap-2 pl-4">
          <Checkbox value="mini-grizzlyrin-1" parent="grizzlyrin">
            Mini Grizzlyrin 1
          </Checkbox>
          <Checkbox value="mini-grizzlyrin-2" parent="grizzlyrin">
            Mini Grizzlyrin 2
          </Checkbox>
        </div>
      </div>
    </CheckboxGroup>
  );
};

export const Disabled = () => {
  return (
    <CheckboxGroup disabled>
      <Checkbox value="astrobears">Astrobears</Checkbox>
      <div className="flex flex-col gap-2 pl-4">
        <Checkbox value="bearstrong" parent="astrobears">
          Bearstrong
        </Checkbox>
        <Checkbox value="pawdrin" parent="astrobears">
          Buzz Pawdrin
        </Checkbox>
        <Checkbox value="grizzlyrin" parent="astrobears">
          Yuri Grizzlyrin
        </Checkbox>
        <div className="flex flex-col gap-2 pl-4">
          <Checkbox value="mini-grizzlyrin-1" parent="grizzlyrin">
            Mini Grizzlyrin 1
          </Checkbox>
          <Checkbox value="mini-grizzlyrin-2" parent="grizzlyrin">
            Mini Grizzlyrin 2
          </Checkbox>
        </div>
      </div>
    </CheckboxGroup>
  );
};

export const DisabledOption = () => {
  return (
    <CheckboxGroup>
      <Checkbox value="astrobears">Astrobears</Checkbox>
      <div className="flex flex-col gap-2 pl-4">
        <Checkbox value="bearstrong" parent="astrobears">
          Bearstrong
        </Checkbox>
        <Checkbox value="pawdrin" parent="astrobears">
          Buzz Pawdrin
        </Checkbox>
        <Checkbox value="grizzlyrin" parent="astrobears" disabled>
          Yuri Grizzlyrin
        </Checkbox>
        <div className="flex flex-col gap-2 pl-4">
          <Checkbox value="mini-grizzlyrin-1" parent="grizzlyrin">
            Mini Grizzlyrin 1
          </Checkbox>
          <Checkbox value="mini-grizzlyrin-2" parent="grizzlyrin">
            Mini Grizzlyrin 2
          </Checkbox>
        </div>
      </div>
    </CheckboxGroup>
  );
};

export const WithMappedOptions = () => {
  return (
    <CheckboxGroup>
      <Checkbox value="astrobears">Astrobears</Checkbox>
      <div className="flex flex-col gap-2 pl-4">
        {astrobears.map((bear) => {
          return (
            <React.Fragment key={bear.value}>
              <Checkbox value={bear.value} parent="astrobears">
                {bear.label}
              </Checkbox>
              {bear.children && (
                <div className="flex flex-col gap-2 pl-4">
                  {bear.children.map((miniBear) => (
                    <Checkbox
                      key={`${bear.value}-${miniBear.value}`}
                      value={miniBear.value}
                      parent={bear.value}
                    >
                      {miniBear.label}
                    </Checkbox>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </CheckboxGroup>
  );
};

export const Complex = () => {
  // eslint-disable-next-line @eslint-react/no-nested-component-definitions
  const CheckboxAll = ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => {
    return (
      <Checkbox
        render={({ className, ...props }, state) => {
          return (
            <Button
              {...props}
              variant={state.checked ? 'default' : 'secondary'}
              className={state.indeterminate ? 'opacity-70' : ''}
            >
              {children}
            </Button>
          );
        }}
        value={value}
        noLabel
      />
    );
  };
  return (
    <CheckboxGroup className="gap-6">
      <div className="flex gap-3">
        <CheckboxAll value="frontend">Frontend</CheckboxAll>
        <CheckboxAll value="backend">Backend</CheckboxAll>
        <CheckboxAll value="devops">DevOps</CheckboxAll>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Frontend tasks */}
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Frontend</h3>
          <Checkbox value="design" parent="frontend">
            UI/UX Design
          </Checkbox>
          <Checkbox value="react" parent="frontend">
            React Components
          </Checkbox>
          <Checkbox value="animations" parent="frontend" disabled>
            Animations (disabled)
          </Checkbox>
        </div>

        {/* Backend tasks */}
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Backend</h3>
          {/* A nested subgroup under "backend" */}
          <Checkbox value="api" parent="backend">
            API Development
          </Checkbox>

          <div className="flex flex-col gap-2 pl-6">
            <Checkbox value="rest" parent="api">
              REST Endpoints
            </Checkbox>
            <Checkbox value="graphql" parent="api">
              GraphQL Schema
            </Checkbox>
          </div>

          <Checkbox value="db" parent="backend">
            Database Schema
          </Checkbox>
        </div>

        {/* DevOps tasks */}
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">DevOps</h3>
          <Checkbox value="ci" parent="devops" defaultChecked>
            CI/CD Pipeline
          </Checkbox>
          <Checkbox value="monitoring" parent="devops">
            Monitoring & Alerts
          </Checkbox>
        </div>
      </div>
    </CheckboxGroup>
  );
};

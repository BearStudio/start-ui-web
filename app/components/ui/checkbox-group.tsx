import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui-components/react/checkbox-group';
import { ReactNode, useId } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Checkbox } from '@/components/ui/checkbox';
import { useCheckboxGroup } from '@/components/ui/checkbox.utils';

type ChildrenOrOption =
  | {
      children: ReactNode;
      options?: never;
      groups?: never;
    }
  | {
      options: Array<CheckboxOption>;
      children?: never;
      groups?: string[];
    };
export type BaseCheckboxGroupProps = Omit<
  CheckboxGroupPrimitive.Props,
  'children'
> & { isNested?: boolean } & ChildrenOrOption;

/** For now, this component is only meant to work up until 2 level deep nested groups */
export function CheckboxGroup({
  children,
  options,
  groups,
  className,
  isNested: isNestedProp,
  ...props
}: BaseCheckboxGroupProps) {
  const isNested = groups?.length || isNestedProp;
  const groupId = useId();

  const {
    main: { indeterminate, ...main },
    nested,
  } = useCheckboxGroup(
    options?.filter((option) => option.type !== 'root') ?? ([] as TODO),
    {
      groups: groups ?? [],
    }
  );

  return (
    <CheckboxGroupPrimitive
      {...(isNested ? main : {})}
      className={cn(
        'flex flex-col items-start gap-1',
        { 'pl-4': isNested },
        className
      )}
      {...props}
    >
      {options?.map((option) => (
        <CheckboxGroupItem
          key={option.type === 'root' ? `${groupId}-root` : option.value}
          indeterminate={indeterminate}
          nested={option.children ? nested : undefined}
          {...option}
        />
      ))}
      {children}
    </CheckboxGroupPrimitive>
  );
}

type RootOption = {
  type: 'root';
  label: ReactNode;
  value?: string;
  children?: never;
};

type BaseOption = {
  type?: never;
  label: ReactNode;
  value: string;
  children?: never;
};

type NestedOption = {
  type?: never;
  label: ReactNode;
  value: string;
  children?: Array<CheckboxOption>;
};

type CheckboxOption = {
  indeterminate?: boolean;
  nested?: ReturnType<typeof useCheckboxGroup>['nested'];
} & (RootOption | BaseOption | NestedOption);

export function CheckboxGroupItem(option: CheckboxOption) {
  // If the item is a root CheckAll
  if (option.type === 'root')
    return (
      <Checkbox
        parent
        value={option.value}
        indeterminate={option.indeterminate}
        className="-ml-4"
      >
        {option.label}
      </Checkbox>
    );

  // If the item is a regular checkbox
  if (!option.children || !option.children.length) {
    return <Checkbox value={option.value}>{option.label}</Checkbox>;
  }

  // If the item has nested values
  return (
    <CheckboxGroup
      isNested
      options={[
        { type: 'root', label: option.label, value: option.value },
        ...option.children,
      ]}
      {...option.nested}
    />
  );
}

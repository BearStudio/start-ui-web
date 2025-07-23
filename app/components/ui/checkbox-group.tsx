import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui-components/react/checkbox-group';
import { cva, VariantProps } from 'class-variance-authority';
import { ReactNode, useId } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { useCheckboxGroup } from '@/components/ui/checkbox.utils';

const checkboxGroupVariants = cva('flex flex-col items-start gap-1', {
  variants: {
    size: {
      // TODO
      default: '',
      sm: '',
      lg: '',
    },
    isNested: {
      true: 'pl-4',
    },
  },
  defaultVariants: {
    size: 'default',
    isNested: false,
  },
});

export type CheckboxOption = {
  label: ReactNode;
  value: string;
  children?: Array<CheckboxOption>;
};

type BaseCheckboxGroupProps = Omit<CheckboxGroupPrimitive.Props, 'children'>;

type WithChildren = { children: ReactNode };
type WithOptions = {
  checkAll?: { label: ReactNode; value?: string };
  options: Array<CheckboxOption>;
  children?: never;
  groups?: string[];
};
type ChildrenOrOption = OneOf<[WithChildren, WithOptions]>;

export type CheckboxGroupProps = BaseCheckboxGroupProps &
  VariantProps<typeof checkboxGroupVariants> &
  ChildrenOrOption;

/** For now, this component is only meant to work up until 2 levels deep nested groups */
export function CheckboxGroup({
  children,
  options,
  groups,
  size,
  isNested: isNestedProp,
  className,
  ...props
}: CheckboxGroupProps) {
  const isNested = !!isNestedProp || !!groups?.length;

  const formattedClassName = checkboxGroupVariants({
    size,
    isNested,
    className,
  });
  return options?.length ? (
    <CheckboxGroupWithOptions
      options={options}
      groups={groups}
      className={formattedClassName}
      isNested={isNested}
      {...props}
    />
  ) : (
    <CheckboxGroupWithChildren className={formattedClassName} {...props}>
      {children}
    </CheckboxGroupWithChildren>
  );
}

function CheckboxGroupWithOptions({
  options,
  groups,
  checkAll,
  isNested,
  ...props
}: BaseCheckboxGroupProps & WithOptions & { isNested?: boolean }) {
  const groupId = useId();

  const {
    main: { indeterminate, ...main },
    nested,
  } = useCheckboxGroup(options, {
    groups: groups ?? [],
  });

  const rootProps = isNested ? main : {};

  return (
    <CheckboxGroupPrimitive {...rootProps} {...props}>
      {checkAll && (
        <Checkbox
          parent
          value={checkAll.value}
          key={`${groupId}-root`}
          indeterminate={isNested ? undefined : indeterminate}
          className="-ml-4"
        >
          {checkAll.label}
        </Checkbox>
      )}
      {options.map((option) => {
        const nestedGroup = nested[option.value ?? ''];

        if (!option.children || !option.children.length) {
          return (
            <Checkbox key={option.value} value={option.value}>
              {option.label}
            </Checkbox>
          );
        }

        return (
          <CheckboxGroup
            isNested
            key={option.value}
            checkAll={{ label: option.label, value: option.value }}
            options={option.children}
            {...(option.children && nestedGroup
              ? { ...nestedGroup, defaultValue: [] }
              : undefined)}
          />
        );
      })}
    </CheckboxGroupPrimitive>
  );
}

function CheckboxGroupWithChildren({
  children,
  ...props
}: BaseCheckboxGroupProps & WithChildren) {
  return <CheckboxGroupPrimitive {...props}>{children}</CheckboxGroupPrimitive>;
}

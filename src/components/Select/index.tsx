import { ForwardedRef, forwardRef } from 'react';

import {
  AsyncCreatableProps,
  AsyncProps,
  AsyncCreatableSelect as ChakraAsyncCreatableSelect,
  AsyncSelect as ChakraAsyncReactSelect,
  CreatableSelect as ChakraCreatableReactSelect,
  Select as ChakraReactSelect,
  CreatableProps,
  GroupBase,
  Props,
  SelectInstance,
} from 'chakra-react-select';

export type SelectProps<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> =
  | ({ type?: 'select' } & Props<Option, IsMulti, Group>)
  | ({ type: 'creatable' } & CreatableProps<Option, IsMulti, Group>)
  | ({ type: 'async' } & AsyncProps<Option, IsMulti, Group>)
  | ({ type: 'async-creatable' } & AsyncCreatableProps<Option, IsMulti, Group>);

const SelectComponent = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  { type = 'select', ...props }: SelectProps<Option, IsMulti, Group>,
  ref: ForwardedRef<SelectInstance<Option, IsMulti, Group>>
) => {
  const Element = (() => {
    if (type === 'async-creatable') return ChakraAsyncCreatableSelect;
    if (type === 'async') return ChakraAsyncReactSelect;
    if (type === 'creatable') return ChakraCreatableReactSelect;
    return ChakraReactSelect;
  })();

  return (
    <Element
      ref={ref}
      colorScheme="brand"
      selectedOptionColorScheme="brand"
      useBasicStyles
      styles={{ menuPortal: (provided) => ({ ...provided, zIndex: 9999 }) }}
      chakraStyles={{
        dropdownIndicator: (provided) => ({
          ...provided,
          paddingLeft: 0,
          paddingRight: 0,
          margin: 0,
        }),
        control: (provided) => ({
          ...provided,
          paddingLeft: 2,
          paddingRight: 2,
        }),
        valueContainer: (provided) => ({
          ...provided,
          padding: 0,
          pl: 1,
        }),
        multiValue: (provided) => ({
          ...provided,
          _first: {
            ml: -1,
          },
        }),
      }}
      {...props}
    />
  );
};

export const Select = fixedForwardRef(SelectComponent);

// https://www.totaltypescript.com/forwardref-with-generic-components
// eslint-disable-next-line @typescript-eslint/ban-types
function fixedForwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode
): (props: P & React.RefAttributes<T>) => React.ReactNode {
  return forwardRef(render) as ExplicitAny;
}

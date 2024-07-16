import { ForwardedRef } from 'react';

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
import { match } from 'ts-pattern';

import { fixedForwardRef } from '@/lib/utils';

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
  const Element = match(type)
    .with('async-creatable', () => ChakraAsyncCreatableSelect)
    .with('async', () => ChakraAsyncReactSelect)
    .with('creatable', () => ChakraCreatableReactSelect)
    .with('select', () => ChakraReactSelect)
    .exhaustive();

  return (
    <Element
      ref={ref}
      colorScheme="brand"
      selectedOptionColorScheme="brand"
      useBasicStyles
      styles={{ menuPortal: (provided) => ({ ...provided, zIndex: 9999 }) }}
      menuPortalTarget={document.body}
      chakraStyles={{
        dropdownIndicator: (provided, state) => ({
          ...provided,
          paddingLeft: 0,
          paddingRight: 0,
          margin: 0,
          ...props.chakraStyles?.dropdownIndicator?.(provided, state),
        }),
        control: (provided, state) => ({
          ...provided,
          paddingLeft: 2,
          paddingRight: 2,
          ...props.chakraStyles?.control?.(provided, state),
        }),
        valueContainer: (provided, state) => ({
          ...provided,
          padding: 0,
          pl: 1,
          ...props.chakraStyles?.valueContainer?.(provided, state),
        }),
        multiValue: (provided, state) => ({
          ...provided,
          _first: {
            ml: -1,
          },
          ...props.chakraStyles?.multiValue?.(provided, state),
        }),
      }}
      {...props}
    />
  );
};

export const Select = fixedForwardRef(SelectComponent);

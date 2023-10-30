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

export const Select = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  type = 'select',
  ...props
}: SelectProps<Option, IsMulti, Group>) => {
  const Element = (() => {
    if (type === 'async-creatable') return ChakraAsyncCreatableSelect;
    if (type === 'async') return ChakraAsyncReactSelect;
    if (type === 'creatable') return ChakraCreatableReactSelect;
    return ChakraReactSelect;
  })();

  return (
    <Element
      colorScheme="brand"
      selectedOptionColorScheme="brand"
      useBasicStyles
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

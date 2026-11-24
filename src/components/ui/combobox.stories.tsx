import type { Meta } from '@storybook/react-vite';
import type * as React from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from './combobox';

export default {
  title: 'Combobox',
} satisfies Meta<typeof Combobox>;

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'grapes', label: 'Grapes' },
  { value: 'pineapple', label: 'Pineapple' },
];

export function Default() {
  return (
    <Combobox items={options} defaultValue={options[0]?.value}>
      <ComboboxInput
        aria-label="Fruit"
        placeholder="Select a fruit"
        showClear
      />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof options)[number]) => (
            <ComboboxItem value={item.value} key={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function Invalid() {
  return (
    <Combobox items={options} defaultValue={options[0]?.value}>
      <ComboboxInput
        aria-label="Fruit"
        aria-invalid={true}
        placeholder="Select a fruit"
        showClear
      />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof options)[number]) => (
            <ComboboxItem value={item.value} key={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function Disabled() {
  return (
    <Combobox items={options} defaultValue={options[0]?.value}>
      <ComboboxInput
        aria-label="Fruit"
        disabled
        placeholder="Select a fruit"
        showClear
      />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof options)[number]) => (
            <ComboboxItem value={item.value} key={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function Sizes() {
  return (
    <div className="flex gap-4">
      <Combobox items={options} defaultValue={options[0]?.value}>
        <ComboboxInput
          aria-label="Fruit"
          size="sm"
          placeholder="Select a fruit"
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: (typeof options)[number]) => (
              <ComboboxItem value={item.value} key={item.value}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Combobox items={options} defaultValue={options[0]?.value}>
        <ComboboxInput
          aria-label="Fruit"
          placeholder="Select a fruit"
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: (typeof options)[number]) => (
              <ComboboxItem value={item.value} key={item.value}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Combobox items={options} defaultValue={options[0]?.value}>
        <ComboboxInput
          aria-label="Fruit"
          size="lg"
          placeholder="Select a fruit"
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: (typeof options)[number]) => (
              <ComboboxItem value={item.value} key={item.value}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function MultipleCombobox({
  size,
  invalid,
  disabled,
}: {
  size?: React.ComponentProps<typeof ComboboxChips>['size'];
  invalid?: boolean;
  disabled?: boolean;
}) {
  const anchor = useComboboxAnchor();
  return (
    <Combobox
      items={options}
      defaultValue={['apple']}
      multiple
      disabled={disabled}
    >
      <ComboboxChips className="flex-1" size={size} ref={anchor}>
        <ComboboxValue>
          {(values: string[], { labels }) =>
            values.map((value, index) => (
              <ComboboxChip key={value} value={value}>
                {labels[index]}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput
          aria-label="Fruits"
          aria-invalid={invalid}
          placeholder="Add..."
        />
        <ComboboxClear />
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof options)[number]) => (
            <ComboboxItem value={item.value} key={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function Multiple() {
  return <MultipleCombobox />;
}

export function MultipleDisabled() {
  return <MultipleCombobox disabled />;
}

export function MultipleInvalid() {
  return <MultipleCombobox invalid />;
}

export function MultipleSizes() {
  return (
    <div className="flex items-start gap-4">
      <MultipleCombobox size="sm" />
      <MultipleCombobox />
      <MultipleCombobox size="lg" />
    </div>
  );
}

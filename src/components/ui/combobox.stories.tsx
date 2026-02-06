import type { Meta } from '@storybook/react-vite';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './combobox';

export default {
  title: 'Combobox',
} satisfies Meta<typeof Combobox>;

const options = [
  { id: 1, label: 'Apple' },
  { id: 2, label: 'Banana' },
  { id: 3, label: 'Blueberry' },
  { id: 4, label: 'Grapes' },
  { id: 5, label: 'Pineapple' },
];

export function Default() {
  return (
    <Combobox
      items={options}
      defaultValue={options[0]}
      itemToStringLabel={(item) => item.label}
    >
      <ComboboxInput placeholder="Select a fruit" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof options)[number]) => (
            <ComboboxItem value={item} key={item.id}>
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
    <Combobox
      items={options}
      defaultValue={options[0]}
      itemToStringLabel={(item) => item.label}
    >
      <ComboboxInput aria-invalid={true} placeholder="Select a fruit" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof options)[number]) => (
            <ComboboxItem value={item} key={item.id}>
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
    <Combobox
      items={options}
      defaultValue={options[0]}
      itemToStringLabel={(item) => item.label}
    >
      <ComboboxInput disabled placeholder="Select a fruit" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof options)[number]) => (
            <ComboboxItem value={item} key={item.id}>
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
      <Combobox
        items={options}
        defaultValue={options[0]}
        itemToStringLabel={(item) => item.label}
      >
        <ComboboxInput size="sm" placeholder="Select a fruit" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: (typeof options)[number]) => (
              <ComboboxItem value={item} key={item.id}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Combobox
        items={options}
        defaultValue={options[0]}
        itemToStringLabel={(item) => item.label}
      >
        <ComboboxInput placeholder="Select a fruit" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: (typeof options)[number]) => (
              <ComboboxItem value={item} key={item.id}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Combobox
        items={options}
        defaultValue={options[0]}
        itemToStringLabel={(item) => item.label}
      >
        <ComboboxInput size="lg" placeholder="Select a fruit" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: (typeof options)[number]) => (
              <ComboboxItem value={item} key={item.id}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

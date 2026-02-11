import type { Meta } from '@storybook/react-vite';
import * as React from 'react';

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
  { id: 1, label: 'Apple' },
  { id: 2, label: 'Banana' },
  { id: 3, label: 'Blueberry' },
  { id: 4, label: 'Grapes' },
  { id: 5, label: 'Pineapple' },
];

export function Default() {
  return (
    <Combobox items={options} defaultValue={options[0]}>
      <ComboboxInput placeholder="Select a fruit" showClear />
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
    <Combobox items={options} defaultValue={options[0]}>
      <ComboboxInput
        aria-invalid={true}
        placeholder="Select a fruit"
        showClear
      />
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
    <Combobox items={options} defaultValue={options[0]}>
      <ComboboxInput disabled placeholder="Select a fruit" showClear />
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
      <Combobox items={options} defaultValue={options[0]}>
        <ComboboxInput size="sm" placeholder="Select a fruit" showClear />
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
      <Combobox items={options} defaultValue={options[0]}>
        <ComboboxInput placeholder="Select a fruit" showClear />
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
      <Combobox items={options} defaultValue={options[0]}>
        <ComboboxInput size="lg" placeholder="Select a fruit" showClear />
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

export function Multiple() {
  const anchor = useComboboxAnchor();
  return (
    <Combobox items={options} defaultValue={[options[0]]} multiple>
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(items) => (
            <React.Fragment>
              {items.map((item: (typeof options)[number]) => (
                <ComboboxChip key={item.id}>{item.label}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder="Add..." />
              <ComboboxClear />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
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

export function MultipleDisabled() {
  const anchor = useComboboxAnchor();
  return (
    <Combobox disabled items={options} defaultValue={[options[0]]} multiple>
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(items) => (
            <React.Fragment>
              {items.map((item: (typeof options)[number]) => (
                <ComboboxChip key={item.id}>{item.label}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder="Add..." />
              <ComboboxClear />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
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

export function MultipleInvalid() {
  const anchor = useComboboxAnchor();
  return (
    <Combobox items={options} defaultValue={[options[0]]} multiple>
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(items) => (
            <React.Fragment>
              {items.map((item: (typeof options)[number]) => (
                <ComboboxChip key={item.id}>{item.label}</ComboboxChip>
              ))}
              <ComboboxChipsInput aria-invalid={true} placeholder="Add..." />
              <ComboboxClear />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
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

export function MultipleSizes() {
  const anchorSm = useComboboxAnchor();
  const anchorDefault = useComboboxAnchor();
  const anchorLg = useComboboxAnchor();
  return (
    <div className="flex items-start gap-4">
      <Combobox items={options} defaultValue={[options[0]]} multiple>
        <ComboboxChips className="flex-1" size="sm" ref={anchorSm}>
          <ComboboxValue>
            {(items) => (
              <React.Fragment>
                {items.map((item: (typeof options)[number]) => (
                  <ComboboxChip key={item.id}>{item.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Add..." />
                <ComboboxClear />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>

        <ComboboxContent anchor={anchorSm}>
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

      <Combobox items={options} defaultValue={[options[0]]} multiple>
        <ComboboxChips className="flex-1" ref={anchorDefault}>
          <ComboboxValue>
            {(items) => (
              <React.Fragment>
                {items.map((item: (typeof options)[number]) => (
                  <ComboboxChip key={item.id}>{item.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Add..." />
                <ComboboxClear />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>

        <ComboboxContent anchor={anchorDefault}>
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

      <Combobox items={options} defaultValue={[options[0]]} multiple>
        <ComboboxChips className="flex-1" size="lg" ref={anchorLg}>
          <ComboboxValue>
            {(items) => (
              <React.Fragment>
                {items.map((item: (typeof options)[number]) => (
                  <ComboboxChip key={item.id}>{item.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Add..." />
                <ComboboxClear />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>

        <ComboboxContent anchor={anchorLg}>
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

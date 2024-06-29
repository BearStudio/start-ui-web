import { useState } from 'react';

import dayjs from 'dayjs';
import { P, match } from 'ts-pattern';
import { z } from 'zod';

import { FormField } from '@/components/Form';

import { FilterPopover } from '.';

export default {
  title: 'Components/FilterPopover',
};

const zFilterStarterFormSchema = () =>
  z.object({
    starter: z.string().nullable(),
  });

const options = ['Start UI [web]', 'Start UI [native]', 'Start UI [figma]'].map(
  (v) => ({
    label: v,
    value: v.toLocaleLowerCase(),
  })
);

// MARK: Default
export const Default = () => {
  const [value, setValue] = useState<string | null>(null);

  return (
    <FilterPopover
      isActive={!!value}
      formatLabel={() => (
        <>
          Starter{' '}
          {value ? (
            <> : {options.find((o) => o.value === value)?.label}</>
          ) : null}
        </>
      )}
      value={{ starter: value }}
      onSubmit={(values) => {
        setValue(values?.starter ?? null);
      }}
      schema={zFilterStarterFormSchema()}
    >
      {(form) => (
        <FormField
          // Provide the `control` so you can enjoy the `name` typings
          control={form.control}
          type="select"
          name="starter"
          options={options}
        />
      )}
    </FilterPopover>
  );
};

// MARK: Select and value
export const WithSelectAndValue = () => {
  const [value, setValue] = useState<string | null>('start ui [native]');

  const options = [
    'Start UI [web]',
    'Start UI [native]',
    'Start UI [figma]',
  ].map((v) => ({
    label: v,
    value: v.toLocaleLowerCase(),
  }));

  return (
    <FilterPopover
      isActive={!!value}
      formatLabel={() => (
        <>
          Starter{' '}
          {value ? (
            <> : {options.find((o) => o.value === value)?.label}</>
          ) : null}
        </>
      )}
      value={{ starter: value }}
      onSubmit={(values) => {
        setValue(values?.starter ?? null);
      }}
      schema={zFilterStarterFormSchema()}
    >
      {(form) => (
        <FormField
          // Provide the `control` so you can enjoy the `name` typings
          control={form.control}
          type="select"
          name="starter"
          options={options}
        />
      )}
    </FilterPopover>
  );
};

const zFilterStartersFormSchema = () =>
  z.object({
    starters: z.array(z.string()).nullable(),
  });

// MARK: MultiSelect and value
export const WithMultiSelectAndValue = () => {
  const [value, setValue] = useState<Array<string>>(['start ui [figma]']);

  const options = [
    'Start UI [web]',
    'Start UI [native]',
    'Start UI [figma]',
  ].map((v) => ({
    label: v,
    value: v.toLocaleLowerCase(),
  }));

  const label = match(value.length)
    .with(P.not(P.number), () => null)
    .with(0, () => null)
    .with(1, () => (
      <> : {options.find((o) => value.includes(o.value))?.label}</>
    ))
    .otherwise(() => <> : {value.length}</>);

  return (
    <FilterPopover
      isActive={value && value.length > 0}
      formatLabel={() => <>Starters {label}</>}
      onSubmit={(values) => {
        setValue(values?.starters ?? []);
      }}
      schema={zFilterStartersFormSchema()}
      value={{ starters: value }}
    >
      {(form) => (
        <FormField
          // Provide the `control` so you can enjoy the `name` typings
          control={form.control}
          type="multi-select"
          name="starters"
          options={options}
        />
      )}
    </FilterPopover>
  );
};

const zFilterDatesFormSchema = () =>
  z
    .object({
      start: z.date().nullable(),
      end: z.date().nullable(),
    })
    .refine(
      (values) => {
        if (!values.start || !values.end) {
          return true;
        }

        return values.start.getTime() <= values.end.getTime();
      },
      { path: ['end'], message: 'End date should be after start date' }
    );

// MARK: Date
export const WithDate = () => {
  const [value, setValue] = useState<
    z.infer<ReturnType<typeof zFilterDatesFormSchema>>
  >({
    start: null,
    end: null,
  });

  const label = match(value)
    .with({ start: P.nonNullable, end: null }, ({ start }) => (
      <>: From {dayjs(start).format('DD/MM/YYYY')}</>
    ))
    .with({ start: null, end: P.nonNullable }, ({ end }) => (
      <>: To {dayjs(end).format('DD/MM/YYYY')}</>
    ))
    .with({ start: P.nonNullable, end: P.nonNullable }, ({ start, end }) => (
      <>
        : From {dayjs(start).format('DD/MM/YYYY')} to{' '}
        {dayjs(end).format('DD/MM/YYYY')}
      </>
    ))
    .otherwise(() => null);

  return (
    <FilterPopover
      isActive={!!value && (!!value.start || !!value.end)}
      formatLabel={() => <>Range{label}</>}
      onSubmit={(values) => {
        setValue(values ?? { start: null, end: null });
      }}
      value={value}
      schema={zFilterDatesFormSchema()}
    >
      {() => (
        <>
          <FormField type="date" name="start" />
          <FormField type="date" name="end" />
        </>
      )}
    </FilterPopover>
  );
};

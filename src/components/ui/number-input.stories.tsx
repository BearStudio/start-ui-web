import { Meta } from '@storybook/react-vite';
import { useState } from 'react';

import { NumberInput } from '@/components/ui/number-input';

export default {
  title: 'NumberInput',
} satisfies Meta<typeof NumberInput>;

export const Default = () => {
  return <NumberInput />;
};

export const Placeholder = () => {
  return <NumberInput placeholder="Enter a number" />;
};

export const Invalid = () => {
  return <NumberInput aria-invalid={true} data-invalid />;
};

export const Disabled = () => {
  return (
    <div className="flex flex-col gap-2">
      <NumberInput disabled />
      <NumberInput disabled buttons="classic" />
      <NumberInput disabled buttons="mobile" />
    </div>
  );
};

export const Readonly = () => {
  return (
    <div className="flex flex-col gap-2">
      <NumberInput readOnly />
      <NumberInput readOnly buttons="classic" />
      <NumberInput readOnly buttons="mobile" />
    </div>
  );
};

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-2">
      <NumberInput size="sm" />
      <NumberInput />
      <NumberInput size="lg" />
    </div>
  );
};

export const MinMax = () => {
  return <NumberInput min={0} max={10} defaultValue={4} />;
};

export const Precision = () => {
  return <NumberInput format={{ maximumFractionDigits: 3 }} />;
};

export const FixedPrecision = () => {
  return <NumberInput format={{ minimumFractionDigits: 3 }} />;
};

export const Currency = () => {
  const [value, setValue] = useState<number | null>(2025.04);

  return (
    <div className="flex flex-col gap-2">
      <NumberInput
        format={{ style: 'currency', currency: 'EUR' }}
        defaultValue={value ?? undefined}
        onValueChange={(v) => setValue(v)}
      />
      <NumberInput
        format={{ style: 'currency', currency: 'GBP' }}
        onValueChange={(v) => {
          setValue(v);
        }}
        value={value}
      />
      <NumberInput
        format={{ style: 'currency', currency: 'USD' }}
        onValueChange={(v) => setValue(v)}
        value={value}
      />
      <code>
        <pre>{value}</pre>
      </code>
    </div>
  );
};

export const Locale = () => {
  const [value, setValue] = useState<number | null>(2025.04);

  return (
    <div className="flex flex-col gap-2">
      <p>
        The default locale is the one provided by the i18next provider. Take a
        look at the "Currency" story and change the language in the Storybook
        addon.
      </p>
      <NumberInput
        locale="fr"
        format={{
          style: 'currency',
          currency: 'EUR',
        }}
        value={value}
        onValueChange={(v) => setValue(v)}
      />
      <NumberInput
        locale="fr"
        format={{ style: 'currency', currency: 'GBP' }}
        value={value}
        onValueChange={(v) => setValue(v)}
      />
      <NumberInput
        locale="fr"
        format={{ style: 'currency', currency: 'USD' }}
        value={value}
        onValueChange={(v) => setValue(v)}
      />
    </div>
  );
};

export const Steps = () => {
  return <NumberInput step={0.01} />;
};

export const ShowButtons = () => {
  return (
    <div className="flex flex-col gap-2">
      <NumberInput buttons="classic" />
      <NumberInput buttons="mobile" />
    </div>
  );
};

export const Controlled = () => {
  const [value, setValue] = useState<number | null>(10);
  return (
    <div>
      <NumberInput value={value} onValueChange={(v) => setValue(v)} />
      <p>Value: {value}</p>
    </div>
  );
};

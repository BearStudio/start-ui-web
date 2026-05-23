import { useState } from 'react';

import { NumberInput } from '@/platform/components/ui/number-input';
const Default = () => {
  return <NumberInput />;
};

const Placeholder = () => {
  return <NumberInput placeholder="Enter a number" />;
};

const Invalid = () => {
  return <NumberInput aria-invalid={true} data-invalid />;
};

const Disabled = () => {
  return (
    <div className="flex flex-col gap-2">
      <NumberInput disabled />
      <NumberInput disabled buttons="classic" />
      <NumberInput disabled buttons="mobile" />
    </div>
  );
};

const Readonly = () => {
  return (
    <div className="flex flex-col gap-2">
      <NumberInput readOnly />
      <NumberInput readOnly buttons="classic" />
      <NumberInput readOnly buttons="mobile" />
    </div>
  );
};

const Sizes = () => {
  return (
    <div className="flex flex-col gap-2">
      <NumberInput size="sm" />
      <NumberInput />
      <NumberInput size="lg" />
    </div>
  );
};

const MinMax = () => {
  return <NumberInput min={0} max={10} defaultValue={4} />;
};

const Precision = () => {
  return <NumberInput format={{ maximumFractionDigits: 3 }} />;
};

const FixedPrecision = () => {
  return <NumberInput format={{ minimumFractionDigits: 3 }} />;
};

const Currency = () => {
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

const Locale = () => {
  const [value, setValue] = useState<number | null>(2025.04);

  return (
    <div className="flex flex-col gap-2">
      <p>
        The default locale is the one provided by the i18next provider. Take a
        look at the "Currency" story and change the locale in a Cosmos fixture.
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

const Steps = () => {
  return <NumberInput step={0.01} />;
};

const ShowButtons = () => {
  return (
    <div className="flex flex-col gap-2">
      <NumberInput buttons="classic" />
      <NumberInput buttons="mobile" />
    </div>
  );
};

const Controlled = () => {
  const [value, setValue] = useState<number | null>(10);
  return (
    <div>
      <NumberInput value={value} onValueChange={(v) => setValue(v)} />
      <p>Value: {value}</p>
    </div>
  );
};

export default {
  Default,
  Placeholder,
  Invalid,
  Disabled,
  Readonly,
  Sizes,
  MinMax,
  Precision,
  FixedPrecision,
  Currency,
  Locale,
  Steps,
  ShowButtons,
  Controlled,
};

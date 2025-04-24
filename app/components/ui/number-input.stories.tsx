import { Meta } from '@storybook/react';
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

export const MinMax = () => {
  return <NumberInput min={0} max={10} defaultValue="4" />;
};

export const Precision = () => {
  return <NumberInput formatOptions={{ maximumFractionDigits: 3 }} />;
};

export const FixedPrecision = () => {
  return <NumberInput formatOptions={{ minimumFractionDigits: 3 }} />;
};

export const Currency = () => {
  const [value, setValue] = useState('2025.04');

  return (
    <div className="flex flex-col gap-2">
      <NumberInput
        formatOptions={{ style: 'currency', currency: 'EUR' }}
        defaultValue={value}
        onValueChange={(details) => {
          if (details.valueAsNumber && !isNaN(details.valueAsNumber)) {
            setValue(details.valueAsNumber.toString());
          }
        }}
      />
      <NumberInput
        formatOptions={{ style: 'currency', currency: 'GBP' }}
        onValueChange={(details) => {
          if (details.valueAsNumber && !isNaN(details.valueAsNumber)) {
            setValue(details.valueAsNumber.toString());
          }
        }}
        value={value}
      />
      <NumberInput
        formatOptions={{ style: 'currency', currency: 'USD' }}
        onValueChange={(details) => {
          if (details.valueAsNumber && !isNaN(details.valueAsNumber)) {
            setValue(details.valueAsNumber.toString());
          }
        }}
        value={value}
      />
      <code>
        <pre>{value}</pre>
      </code>
    </div>
  );
};

export const Locale = () => {
  const [value, setValue] = useState('2025.04');

  return (
    <div className="flex flex-col gap-2">
      <p>
        The default locale is the one provided by the i18next provider. Take a
        look at the "Currency" story and change the language in the Storybook
        addon.
      </p>
      <NumberInput
        locale="fr"
        formatOptions={{
          style: 'currency',
          currency: 'EUR',
        }}
        value={value}
        onValueChange={(details) => {
          if (details.valueAsNumber && !isNaN(details.valueAsNumber)) {
            setValue(details.valueAsNumber.toString());
          }
        }}
      />
      <NumberInput
        locale="fr"
        formatOptions={{ style: 'currency', currency: 'GBP' }}
        value={value}
        onValueChange={(details) => {
          if (details.valueAsNumber && !isNaN(details.valueAsNumber)) {
            setValue(details.valueAsNumber.toString());
          }
        }}
      />
      <NumberInput
        locale="fr"
        formatOptions={{ style: 'currency', currency: 'USD' }}
        value={value}
        onValueChange={(details) => {
          if (details.valueAsNumber && !isNaN(details.valueAsNumber)) {
            setValue(details.valueAsNumber.toString());
          }
        }}
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

import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

export default {
  title: 'ConfirmResponsiveDrawer',
} satisfies Meta<typeof ConfirmResponsiveDrawer>;

export function Default() {
  return (
    <ConfirmResponsiveDrawer onConfirm={() => alert('Custom Action')}>
      <Button>Confirm</Button>
    </ConfirmResponsiveDrawer>
  );
}

export function WithCustomProps() {
  return (
    <ConfirmResponsiveDrawer
      title="ConfirmModal Title"
      description="Custom message"
      onConfirm={() => alert('Custom Action')}
      confirmText="Custom Text"
      confirmVariant="destructive"
    >
      <Button>Trigger Modal</Button>
    </ConfirmResponsiveDrawer>
  );
}

export function EnabledProps() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Enabled
      </label>
      <ConfirmResponsiveDrawer
        onConfirm={() => alert('Custom Action')}
        enabled={enabled}
      >
        <Button>{enabled ? 'Confirm' : 'Without confirm'}</Button>
      </ConfirmResponsiveDrawer>
    </div>
  );
}

export function WithPromise() {
  return (
    <ConfirmResponsiveDrawer
      onConfirm={async () => new Promise((r) => setTimeout(r, 2000))}
    >
      <Button>Confirm</Button>
    </ConfirmResponsiveDrawer>
  );
}

import { Meta } from '@storybook/react-vite';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  TerminalIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default {
  title: 'Alert',
} satisfies Meta<typeof Alert>;

export const Default = () => {
  return (
    <Alert>
      <TerminalIcon className="size-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  );
};

export const Variants = () => {
  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <TerminalIcon className="size-4" />
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>
          You can add components to your app using the cli.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlertIcon className="size-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Your subscription is about to expire.
        </AlertDescription>
      </Alert>
      <Alert variant="positive">
        <CheckCircleIcon className="size-4" />
        <AlertTitle>Positive</AlertTitle>
        <AlertDescription>
          Your changes have been saved successfully.
        </AlertDescription>
      </Alert>
    </div>
  );
};

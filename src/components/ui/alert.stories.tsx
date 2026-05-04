import type { StoryDefault } from '@ladle/react';
import { AlertCircleIcon, TerminalIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default {
  title: 'Alert',
} satisfies StoryDefault;

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

export const Destructive = () => {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  );
};

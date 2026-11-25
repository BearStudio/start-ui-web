import { Meta } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import { toast, Toaster } from '@/components/ui/toast';

export default {
  title: 'Toast',
} satisfies Meta<typeof Toaster>;

export const Default = () => {
  return (
    <Button
      onClick={() =>
        toast.success('Hey there, thanks for checking out Start UI! [web]')
      }
    >
      Show toast
    </Button>
  );
};

export const Types = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => toast('Event created')}>
        Default
      </Button>
      <Button variant="secondary" onClick={() => toast.success('Saved')}>
        Success
      </Button>
      <Button variant="secondary" onClick={() => toast.info('New version')}>
        Info
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.warning('Storage is almost full')}
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.error("Couldn't save changes")}
      >
        Error
      </Button>
    </div>
  );
};

export const WithDescriptionAndAction = () => {
  return (
    <Button
      onClick={() =>
        toast('Message archived', {
          description: 'You can find it in the archive.',
          action: { label: 'Undo', onAction: () => toast('Message restored') },
          cancel: { label: 'Dismiss' },
        })
      }
    >
      Archive message
    </Button>
  );
};

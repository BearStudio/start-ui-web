import { Meta } from '@storybook/react';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

export default {
  title: 'Toaster',
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster />
      </div>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export const Default = () => {
  return (
    <div className="flex flex-col gap-2">
      <p>
        Find everything about sonner in{' '}
        <Button asChild variant="link">
          <a
            href="https://sonner.emilkowal.ski/toast"
            target="_blank"
            rel="noreferrer"
          >
            the dedicated documentation <ExternalLink />
          </a>
        </Button>
      </p>
      <div>
        <Button
          onClick={() =>
            toast('Hey there, thanks for checking out Start UI! [web]')
          }
        >
          Show toast
        </Button>
      </div>
    </div>
  );
};

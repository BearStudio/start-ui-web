import type { Meta } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default {
  title: 'Tooltip',
} satisfies Meta<typeof Tooltip>;

export function Default() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>
        Hover
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  );
}

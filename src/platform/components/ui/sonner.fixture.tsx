import { toast } from 'sonner';

import { Button } from '@/platform/components/ui/button';

const Default = () => {
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

export default {
  Default,
};

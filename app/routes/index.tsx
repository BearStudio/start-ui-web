import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [state, setState] = useState(1);

  return (
    <Button
      onClick={() => {
        setState((s) => s + 1);
      }}
    >
      Counter {state}
    </Button>
  );
}

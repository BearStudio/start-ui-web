import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { orpc } from '@/lib/orpc-client';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [state, setState] = useState(1);

  return (
    <Button
      onClick={async () => {
        setState((s) => s + 1);
        console.log((await orpc.planet.find({ id: 1 })).id);
      }}
    >
      Counter {state}
    </Button>
  );
}

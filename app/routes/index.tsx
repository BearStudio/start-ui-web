import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';

import { Outputs } from '@/server/router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [state, setState] = useState(1);
  const queryClient = useQueryClient();
  const planets = useQuery(orpc.planet.list.queryOptions());

  const createPlanet = useMutation(
    orpc.planet.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData<Outputs['planet']['list']>(
          orpc.planet.list.key({ type: 'query' }),
          (d) => {
            console.log({ d });
            return [...(d ?? []), data];
          }
        );
      },
    })
  );

  return (
    <div>
      <Button
        onClick={async () => {
          setState((s) => s + 1);
        }}
      >
        Counter {state}
      </Button>
      <Button
        loading={createPlanet.isPending}
        onClick={() => {
          createPlanet.mutate({ name: 'Hello' });
        }}
      >
        Create Planet
      </Button>
      <h2>Planets</h2>
      {planets.isLoading && <div>Loading...</div>}
      {planets.data?.map((planet) => (
        <Link
          key={planet.id}
          to="/planet/$id"
          params={{ id: planet.id.toString() }}
        >
          {planet.name}
        </Link>
      ))}
    </div>
  );
}

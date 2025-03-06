import { createFileRoute, Link } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

export const Route = createFileRoute('/planet/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return {
      planet: await orpc.planet.find.call({ id: Number(params.id) }),
      // eslint-disable-next-line sonarjs/pseudo-random
      random: Math.random(),
    };
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  return (
    <div>
      <Link to="/">Back</Link>
      Planet {data.planet.name} {data.random}
    </div>
  );
}

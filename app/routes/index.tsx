import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authClient } from '@/lib/auth/client';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';
import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';

import { Outputs } from '@/server/router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const session = authClient.useSession();
  const { i18n, t } = useTranslation(['common']);
  const [state, setState] = useState(1);
  const queryClient = useQueryClient();
  const planets = useQuery(orpc.planet.list.queryOptions());

  const createPlanet = useMutation(
    orpc.planet.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData<Outputs['planet']['list']>(
          orpc.planet.list.key({ type: 'query' }),
          (d) => [...(d ?? []), data]
        );
      },
    })
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-4">
        <Button
          onClick={async () => {
            setState((s) => s + 1);
          }}
        >
          Counter {state}
        </Button>
        {AVAILABLE_LANGUAGES.map(({ key }) => (
          <Button
            key={key}
            className="uppercase"
            variant="secondary"
            disabled={i18n.language === key}
            onClick={() => {
              i18n.changeLanguage(key);
            }}
          >
            {key}
          </Button>
        ))}
        <Button
          loading={createPlanet.isPending}
          onClick={() => {
            createPlanet.mutate({ name: 'Hello' });
          }}
        >
          Create Planet
        </Button>
      </div>

      <h2 className="font-bold">Planets</h2>
      <div className="flex gap-4">
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
      <p>This is a translated string: {t('common:actions.edit')}</p>
      <Link to="/demo">Demo</Link>
      {session.data?.user ? (
        <div>
          {session.data.user.email}
          <Button onClick={() => authClient.signOut()}>Logout</Button>
        </div>
      ) : (
        <Link to="/login">Login page</Link>
      )}
    </div>
  );
}

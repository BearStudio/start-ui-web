import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';

import { Outputs } from '@/server/router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
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

  const login = useMutation(
    orpc.auth.login.mutationOptions({
      onSuccess: console.log,
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
        disabled={i18n.language === 'fr'}
        onClick={() => {
          i18n.changeLanguage('fr');
        }}
      >
        FR
      </Button>
      <Button
        disabled={i18n.language === 'en'}
        onClick={() => {
          i18n.changeLanguage('en');
        }}
      >
        EN
      </Button>
      <Button
        disabled={i18n.language === 'ar'}
        onClick={() => {
          i18n.changeLanguage('ar');
        }}
      >
        AR
      </Button>
      <Button
        loading={createPlanet.isPending}
        onClick={() => {
          createPlanet.mutate({ name: 'Hello' });
        }}
      >
        Create Planet
      </Button>
      <Button
        loading={login.isPending}
        onClick={() => {
          login.mutate({ email: 'admin@admin.com' });
        }}
      >
        Login
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
      <p>{t('common:actions.edit')}</p>
    </div>
  );
}

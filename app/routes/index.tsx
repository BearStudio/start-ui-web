import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authClient } from '@/lib/auth/client';
import { orpc } from '@/lib/orpc/client';
import { useTheme } from '@/lib/theme/client';

import { Button } from '@/components/ui/button';
import { LocalSwitcher } from '@/components/ui/local-switcher';

import { Outputs } from '@/server/router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const { theme, setTheme } = useTheme();
  const session = authClient.useSession();
  const { t } = useTranslation(['common']);
  const [state, setState] = useState(1);
  const queryClient = useQueryClient();
  const planets = useQuery(orpc.planet.list.queryOptions());

  const signOut = useMutation({
    mutationFn: async () => {
      const response = await authClient.signOut();
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
  });

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
    <>
      <div className="h-safe-top w-full" />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex gap-4">
          <Button
            onClick={async () => {
              setState((s) => s + 1);
            }}
          >
            Counter {state}
          </Button>
          <LocalSwitcher />
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
            <Button
              onClick={() => signOut.mutate()}
              loading={signOut.isPending || signOut.isSuccess}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Link to="/login">Login page</Link>
        )}
        <div>
          <Button
            onClick={() => {
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
          >
            Toggle
          </Button>
        </div>
      </div>
    </>
  );
}

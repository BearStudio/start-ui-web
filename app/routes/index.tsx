import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authClient } from '@/lib/auth/client';
import { WithPermission } from '@/lib/auth/WithPermission';
import { orpc } from '@/lib/orpc/client';
import { useTheme } from '@/lib/theme/client';

import { Button } from '@/components/ui/button';
import { LocalSwitcher } from '@/components/ui/local-switcher';

import { useSignOut } from '@/features/auth/utils';
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

  const signOut = useSignOut();

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
        <WithPermission
          permission={{ apps: ['app'] }}
          fallback={<Link to="/app">No App access</Link>}
        >
          <Link to="/app">Go to App</Link>
        </WithPermission>
        <WithPermission
          permission={{ apps: ['manager'] }}
          fallback={<Link to="/manager">No Manager access</Link>}
        >
          <Link to="/manager">Go to Manager</Link>
        </WithPermission>
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

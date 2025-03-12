import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';
import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Outputs } from '@/server/router';

export const Route = createFileRoute('/')({
  component: Home,
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(z.string().optional(), ''),
    })
  ),
});

function Home() {
  const router = useRouter();
  const search = Route.useSearch();
  const { i18n, t } = useTranslation(['common']);
  const [state, setState] = useState(1);
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
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
      onSuccess: (data) => {
        console.log(data);
        setToken(data.token);
        setCode('000000');
      },
    })
  );

  const loginValidate = useMutation(
    orpc.auth.loginValidate.mutationOptions({
      onSuccess: async () => {
        if (!search.redirect) {
          router.navigate({ to: '/demo' });
          return;
        }
        const redirectUrl = new URL(search.redirect);
        router.navigate({
          to: redirectUrl.pathname,
          search: Object.fromEntries(redirectUrl.searchParams),
        });
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
      <Button
        loading={login.isPending}
        onClick={() => {
          login.mutate({ email: 'admin@admin.com' });
        }}
      >
        Login
      </Button>
      <Input value={code} onChange={(e) => setCode(e.currentTarget.value)} />
      <Button
        loading={loginValidate.isPending}
        onClick={() => {
          loginValidate.mutate({ code, token });
        }}
      >
        Validate Login
      </Button>
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
      <div></div>
    </div>
  );
}

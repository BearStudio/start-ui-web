import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { PageError } from '@/components/errors/page-error';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';

export const PageLogout = () => {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const { mutate, error } = useMutation({
    mutationFn: async () => {
      const response = await authClient.signOut();
      if (response.error) {
        throw response.error;
      }
      await session.refetch();
    },
    onSuccess: () => {
      navigate({
        to: '/',
      });
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  if (error) {
    return <PageError type="unknown-auth-error" />;
  }

  return <Spinner full />;
};

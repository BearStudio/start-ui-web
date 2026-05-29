import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { PageError } from '@/platform/components/errors/page-error';
import { Spinner } from '@/platform/components/ui/spinner';

import {
  clearAllQueryStateForAuthBoundary,
  signOut,
  useAuthSession,
} from '@/modules/auth/client';

export const PageLogout = () => {
  const navigate = useNavigate();
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const { mutate, error } = useMutation({
    mutationFn: async () => {
      const response = await signOut();
      if (response.error) {
        throw response.error;
      }
      await session.refetch();
      clearAllQueryStateForAuthBoundary(queryClient);
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

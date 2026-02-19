import {
  NavigateOptions,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router';

export const useNavigateBack = () => {
  const canGoBack = useCanGoBack();
  const router = useRouter();

  const navigateBack = (options?: {
    ignoreBlocker?: boolean;
    navigateOptions?: NavigateOptions;
  }) => {
    if (canGoBack) {
      router.history.back({ ignoreBlocker: options?.ignoreBlocker });
    } else {
      router.navigate({
        to: '..',
        replace: true,
        ignoreBlocker: options?.ignoreBlocker,
        ...options?.navigateOptions,
      });
    }
  };

  return { navigateBack, canGoBack };
};

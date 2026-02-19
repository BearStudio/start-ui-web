import {
  NavigateOptions,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router';

export const useNavigateBack = () => {
  const canGoBack = useCanGoBack();
  const router = useRouter();

  const navigateBack = (options?: NavigateOptions) => {
    if (canGoBack) {
      router.history.back({ ignoreBlocker: options?.ignoreBlocker });
    } else {
      router.navigate({
        to: '..',
        replace: true,
        ...options,
      });
    }
  };

  return { navigateBack, canGoBack };
};

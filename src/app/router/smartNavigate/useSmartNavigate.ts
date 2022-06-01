import {
  NavigateOptions,
  To,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { getCurrentRoute } from '@/app/router/smartNavigate/utils';

export type SmartNavigateState = {
  from: string;
};

/**
 * @description Hook for manage goBack with an automatic state added when navigate
 *
 * @returns smartNavigate: navigate override that add *from* value to state
 * @returns smartGoBack: goBack using state *from* value, or fallbackRoute param if there is no *from*
 */
export const useSmartNavigate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const previousRoute = (location.state as SmartNavigateState)?.from;
  const currentRoute = getCurrentRoute(location);

  const smartGoBack = (fallbackRoute: string) => {
    if (previousRoute) {
      navigate(previousRoute);
      return;
    }
    fallbackRoute ? navigate(fallbackRoute) : navigate(-1);
  };

  const smartNavigate = (to: To, options: NavigateOptions = {}) => {
    navigate(to, {
      ...options,
      state: { ...(options.state ?? {}), from: currentRoute },
    });
  };

  return {
    smartNavigate,
    smartGoBack,
  };
};

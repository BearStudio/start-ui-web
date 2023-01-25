import { useLocation, useNavigate } from 'react-router-dom';

/**
 * This hook manage navigation back depending to previous page
 *
 * @param defaultFallback fallback url if no one is specify in goBack call or in navigation state
 * @returns goBack function with one param: fallback url if no __goBack value in navigation state
 */
export const useGoBack = (defaultFallback?: string) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (fallbackRoute?: string) => {
    if (state instanceof Object && state?.__goBack) {
      navigate(state?.__goBack);
      return;
    }
    const fallback = fallbackRoute ?? defaultFallback;
    fallback ? navigate(fallback) : navigate(-1);
  };
};

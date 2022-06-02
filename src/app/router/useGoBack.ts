import { useLocation, useNavigate } from 'react-router-dom';

export const useGoBack = (defaultFallback?: string) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (fallbackRoute?: string) => {
    if (state instanceof Object && (state as ExplicitAny)?.__goBack) {
      navigate((state as ExplicitAny)?.__goBack);
      return;
    }
    const fallback = fallbackRoute ?? defaultFallback;
    fallback ? navigate(fallback) : navigate(-1);
  };
};

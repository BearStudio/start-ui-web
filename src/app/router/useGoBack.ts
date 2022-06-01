import { useLocation, useNavigate } from 'react-router-dom';

export const useGoBack = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (fallbackRoute?: string) => {
    if (state instanceof Object && (state as ExplicitAny)?.__goBack) {
      navigate((state as ExplicitAny)?.__goBack);
      return;
    }
    fallbackRoute ? navigate(fallbackRoute) : navigate(-1);
  };
};

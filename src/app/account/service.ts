import axios from 'axios';
import { useMutation, MutationConfig } from 'react-query';

export const useCreateAccount = (config: MutationConfig<any> = {}) => {
  return useMutation(
    ({ login, email, password, langKey = 'en' }) =>
      axios.post('/register', { login, email, password, langKey }),
    {
      ...config,
    }
  );
};

export const useActivateAccount = (config: MutationConfig<any> = {}) => {
  return useMutation(({ key }) => axios.get(`/activate?key=${key}`), {
    ...config,
  });
};

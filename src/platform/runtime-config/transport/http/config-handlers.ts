import type { RuntimeConfigUseCases } from '../../factory';

type ConfigHandlerDeps = {
  getUseCases: () => RuntimeConfigUseCases;
};

export const createConfigHandlers = ({ getUseCases }: ConfigHandlerDeps) => {
  const env = () => getUseCases().get();

  return {
    env,
  };
};

export type ConfigHandlers = ReturnType<typeof createConfigHandlers>;

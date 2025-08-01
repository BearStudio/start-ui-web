import { useEffect } from 'react';
import { create } from 'zustand';

type State = 'default' | 'error';

interface MascotStoreState {
  state: State;
  setState: (newState: State) => void;
}

const useMascotStore = create<MascotStoreState>()((set) => ({
  state: 'default' as const,
  setState: (newState) => set({ state: newState }),
}));

export const useMascot = ({
  initialState = 'default',
  isError,
}: {
  initialState?: State;
  isError?: boolean;
}) => {
  const setState = useMascotStore((s) => s.setState);

  useEffect(() => {
    setState(initialState);
  }, [setState, initialState]);

  useEffect(() => {
    if (isError !== undefined) {
      setState(isError ? 'error' : 'default');
    }
  }, [setState, isError]);

  return { updateMascotState: setState };
};

export const useMascotState = () => {
  return useMascotStore((s) => s.state);
};

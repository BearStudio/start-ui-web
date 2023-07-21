import { create } from 'zustand';

import { LoginModalInterceptor } from '@/features/auth/LoginModalInterceptor';
import { DemoModalInterceptor } from '@/features/demo-mode/DemoModalInterceptor';

type ModalType = 'demo' | 'login' | null;

interface ModalInterceptorState {
  modal: ModalType;
  update: (type: ModalType) => void;
  reset: () => void;
}

export const useModalInterceptor = create<ModalInterceptorState>()((set) => ({
  modal: null,
  update: (type) => set({ modal: type }),
  reset: () => set({ modal: null }),
}));

export const ModalInterceptor = () => {
  const modal = useModalInterceptor((s) => s.modal);
  const reset = useModalInterceptor((s) => s.reset);

  if (modal === 'login') {
    return <LoginModalInterceptor reset={reset} />;
  }
  if (modal === 'demo') {
    return <DemoModalInterceptor reset={reset} />;
  }
  return null;
};

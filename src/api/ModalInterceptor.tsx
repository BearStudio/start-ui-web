import { create } from 'zustand';

import { LoginModalInterceptor } from '@/features/auth/LoginModalInterceptor';
import { DemoModalInterceptor } from '@/features/demo-mode/DemoModalInterceptor';

type ModalType = 'demo' | 'login' | null;

interface ModalInterceptorState {
  modal: ModalType;
  reset: () => void;
}

export const useModalInterceptorStore = create<ModalInterceptorState>()(
  (set) => ({
    modal: null,
    reset: () => set({ modal: null }),
  })
);

export const ModalInterceptor = () => {
  const modal = useModalInterceptorStore((s) => s.modal);
  const reset = useModalInterceptorStore((s) => s.reset);

  if (modal === 'login') {
    return <LoginModalInterceptor onClose={reset} />;
  }
  if (modal === 'demo') {
    return <DemoModalInterceptor onClose={reset} />;
  }
  return null;
};

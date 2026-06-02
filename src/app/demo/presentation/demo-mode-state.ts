import { create } from 'zustand';

type Store = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useDemoModeDrawerStore = create<Store>()((set) => ({
  open: false,
  setOpen: (open) => set(() => ({ open })),
}));

export const useIsDemoModeDrawerVisible = () => {
  return useDemoModeDrawerStore((state) => state.open);
};

export const openDemoModeDrawer = () => {
  useDemoModeDrawerStore.getState().setOpen(true);
};

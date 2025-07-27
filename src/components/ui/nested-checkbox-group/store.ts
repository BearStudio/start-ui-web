import { deepEqual } from 'fast-equals';
import * as React from 'react';
import { createStore, StoreApi } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';

type StoreCheckbox = {
  parent?: string;
  value: string;
  checked?: boolean | 'indeterminate';
  disabled?: boolean;
};

export type CheckboxGroupStore = {
  disabled?: boolean;
  checkboxes: Array<StoreCheckbox>;
  value: () => Array<string>;
  actions: {
    register: (options: {
      parent?: string;
      value: string;
      disabled?: boolean;
      defaultChecked?: boolean;
    }) => void;
    unregister: (options: { value: string }) => void;
    setCheckboxes: (checkboxes: StoreCheckbox[]) => void;
  };
};

export type CreateCheckboxGroupStoreOptions = {
  disabled?: boolean;
};

export const createCheckboxGroupStore = ({
  disabled,
}: CreateCheckboxGroupStoreOptions) => {
  return createStore<CheckboxGroupStore>((set, get) => ({
    disabled,
    checkboxes: [],
    value: () =>
      get()
        .checkboxes.filter((cb) => cb.checked === true && !cb.disabled)
        .map((cb) => cb.value),
    actions: {
      register: ({ value, parent, disabled, defaultChecked }) => {
        set((state) => {
          const parentCheckbox = state.checkboxes.find(
            (c) => c.value === parent
          );
          const groupDisabled = state.disabled;

          return {
            checkboxes: [
              ...state.checkboxes,
              {
                value,
                parent,
                disabled: parentCheckbox?.disabled || disabled || groupDisabled,
                checked: parentCheckbox?.checked || defaultChecked || false,
              },
            ],
          };
        });
      },

      unregister: ({ value }) => {
        set((state) => ({
          checkboxes: state.checkboxes.filter((c) => c.value !== value),
        }));
      },

      setCheckboxes: (checkboxes) => {
        set({ checkboxes });
      },
    },
  }));
};

export const CheckboxGroupContext =
  React.createContext<CheckboxGroupStoreApi | null>(null);

export const useCheckboxGroupStore = <T>(
  selector: (state: CheckboxGroupStore) => T
) => {
  const context = React.use(CheckboxGroupContext);

  if (!context)
    throw new Error(
      'useCheckboxGroupStore must be used within a <NestedCheckboxGroup />'
    );

  return useStoreWithEqualityFn(context, selector, deepEqual);
};

export type CheckboxGroupStoreApi = StoreApi<CheckboxGroupStore>;

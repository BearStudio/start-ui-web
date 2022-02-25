import React, { FC, createContext } from 'react';

import { Stack, StackProps } from '@chakra-ui/react';

export const ProgressContext = createContext<ProgressValues>(null);

export interface ProgressValues {
  completed: number;
  total: number;
  isLoading?: boolean;
}

export interface ProgressProps extends StackProps, ProgressValues {}

export const Progress: FC<ProgressProps> = ({
  completed = 0,
  total,
  isLoading = false,
  ...rest
}) => {
  return (
    <ProgressContext.Provider
      value={{
        completed,
        total,
        isLoading,
      }}
    >
      <Stack spacing={1} {...rest} />
    </ProgressContext.Provider>
  );
};

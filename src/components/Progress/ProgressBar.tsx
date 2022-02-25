import { FC, useContext } from 'react';

import { Progress, ProgressProps } from '@chakra-ui/react';

import { ProgressContext } from '.';

export const ProgressBar: FC<ProgressProps> = (props) => {
  const { completed, total, isLoading } = useContext(ProgressContext);
  return (
    <Progress
      value={(completed / total ?? Infinity) * 100}
      borderRadius="lg"
      height="1"
      isIndeterminate={isLoading}
      {...props}
    />
  );
};

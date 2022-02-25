import { FC } from 'react';

import { Progress, ProgressProps } from '@chakra-ui/react';

import { useProgressContext } from '@/components';

export const ProgressBar: FC<ProgressProps> = (props) => {
  const { completed, total, isLoading } = useProgressContext();
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

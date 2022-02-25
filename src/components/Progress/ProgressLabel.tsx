import { FC, ReactChild } from 'react';

import { Text, TextProps } from '@chakra-ui/react';

import { useProgressContext } from '@/components';

import { ProgressValues } from '.';

export interface ProgressLabelProps extends TextProps {
  children(data: ProgressValues): ReactChild;
}

export const ProgressLabel: FC<ProgressLabelProps> = ({
  children,
  ...rest
}) => {
  const progressValues = useProgressContext();

  return (
    <Text fontWeight="medium" {...rest}>
      {children(progressValues)}
    </Text>
  );
};

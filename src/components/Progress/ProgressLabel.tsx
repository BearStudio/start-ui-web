import { FC, ReactChild, useContext } from 'react';

import { Text, TextProps } from '@chakra-ui/react';

import { ProgressContext, ProgressValues } from '.';

export interface ProgressLabelProps extends TextProps {
  children(data: ProgressValues): ReactChild;
}

export const ProgressLabel: FC<ProgressLabelProps> = ({
  children,
  ...others
}) => {
  const progressData = useContext(ProgressContext);
  return (
    <Text fontWeight="medium" {...others}>
      {children(progressData)}
    </Text>
  );
};

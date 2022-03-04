import { FC } from 'react';

import { useBreakpointValue } from '@chakra-ui/media-query';
import {
  Button,
  ButtonProps,
  IconButton,
  ResponsiveValue,
} from '@chakra-ui/react';

interface ResponsiveIconButtonProps extends ButtonProps {
  hideTextBreakpoints?: Omit<ResponsiveValue<boolean>, 'boolean'>;
  icon: React.ReactElement;
  children: string;
  iconPosition?: 'left' | 'right';
}

export const ResponsiveIconButton: FC<ResponsiveIconButtonProps> = ({
  hideTextBreakpoints = {
    base: true,
    md: false,
  },
  children,
  icon,
  iconPosition = 'left',
  ...rest
}) => {
  const responsiveStates = useBreakpointValue(hideTextBreakpoints);

  return responsiveStates ? (
    <IconButton aria-label={children} icon={icon} {...rest} />
  ) : (
    <Button
      {...(iconPosition === 'right' ? { rightIcon: icon } : { leftIcon: icon })}
      {...rest}
    >
      {children}
    </Button>
  );
};

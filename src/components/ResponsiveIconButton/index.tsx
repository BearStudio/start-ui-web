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

  const buttonProps =
    iconPosition === 'right' ? { rightIcon: icon } : { leftIcon: icon };

  return responsiveStates ? (
    <IconButton aria-label={children} icon={icon} {...rest} />
  ) : (
    <Button {...buttonProps} {...rest}>
      {children}
    </Button>
  );
};

import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/core';

const propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary']),
};

const defaultProps = {
  children: '',
  variant: null,
};

export const ExampleComponent = ({ children, variant, ...props }) => {
  const variantStyles = {
    primary: {
      backgroundColor: 'brand.500',
      color: 'brand.50',
    },
    secondary:{
      backgroundColor: 'brand.100',
      color: 'brand.700',
    }
  }

  return (
    <Box
      fontWeight="bold"
      p="4"
      {...variantStyles[variant]}
      {...props}
    >
      {children}
    </Box>
  );
};

ExampleComponent.propTypes = propTypes;
ExampleComponent.defaultProps = defaultProps;

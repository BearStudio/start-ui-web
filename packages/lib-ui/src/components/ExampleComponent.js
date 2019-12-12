import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/core';

const propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['light']),
  variantColor: PropTypes.string,
};

const defaultProps = {
  children: '',
  variant: null,
  variantColor: 'gray',
};

export const ExampleComponent = ({ children, variant, variantColor, ...props }) => {
  const variantStyles = {
    default: {
      backgroundColor: `${variantColor}.500`,
      color: `${variantColor}.50`,
    },
    light:{
      backgroundColor: `${variantColor}.100`,
      color: `${variantColor}.700`,
    }
  }

  return (
    <Box
      fontWeight="bold"
      p="4"
      {...variantStyles[variant || 'default']}
      {...props}
    >
      {children}
    </Box>
  );
};

ExampleComponent.propTypes = propTypes;
ExampleComponent.defaultProps = defaultProps;

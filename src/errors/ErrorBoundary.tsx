import React from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
  Collapse,
} from '@chakra-ui/core';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

const ErrorFallback = ({ error }: FallbackProps) => {
  const [show, setShow] = React.useState(false);
  return (
    <Box p="4" m="auto">
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>An unexpected error has occurred.</AlertTitle>
          <AlertDescription display="block" lineHeight="1.4">
            <Button
              variant="link"
              color="red.800"
              size="sm"
              rightIcon={show ? <FiChevronUp /> : <FiChevronDown />}
              onClick={() => setShow((x) => !x)}
            >
              Show details
            </Button>
            <Collapse in={show} animateOpacity>
              <Box mt={4} fontFamily="monospace">
                {error.message}
              </Box>
            </Collapse>
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
};

export const ErrorBoundary = ({
  children,
  FallbackComponent = ErrorFallback,
}) => {
  return (
    <ReactErrorBoundary FallbackComponent={FallbackComponent}>
      {children}
    </ReactErrorBoundary>
  );
};

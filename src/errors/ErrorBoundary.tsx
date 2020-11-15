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
  useDisclosure,
} from '@chakra-ui/core';
import { CaretUp, CaretDown } from 'phosphor-react';

const ErrorFallback = ({ error }: FallbackProps) => {
  const { isOpen, onToggle } = useDisclosure();
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
              rightIcon={isOpen ? <CaretUp /> : <CaretDown />}
              onClick={onToggle}
            >
              Show details
            </Button>
            <Collapse in={isOpen} animateOpacity>
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

export const ErrorBoundary = (props) => {
  return <ReactErrorBoundary FallbackComponent={ErrorFallback} {...props} />;
};

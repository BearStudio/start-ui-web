import React, { FC } from 'react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from 'react-error-boundary';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

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
              rightIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
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

export const ErrorBoundary: FC = (props) => {
  return <ReactErrorBoundary FallbackComponent={ErrorFallback} {...props} />;
};

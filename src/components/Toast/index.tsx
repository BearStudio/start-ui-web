import { ReactNode } from 'react';

import {
  Box,
  ButtonGroup,
  Card,
  CardBody,
  Flex,
  Heading,
  IconButton,
} from '@chakra-ui/react';
import i18n from 'i18next';
import { LuCheckCircle2, LuInfo, LuX, LuXCircle } from 'react-icons/lu';
import { ExternalToast, toast } from 'sonner';
import { match } from 'ts-pattern';

import { Icon } from '@/components/Icons';

export const toastCustom = (params: {
  status?: 'info' | 'success' | 'error';
  hideIcon?: boolean;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) => {
  const status = params.status ?? 'info';
  const icon = match(status)
    .with('info', () => LuInfo)
    .with('success', () => LuCheckCircle2)
    .with('error', () => LuXCircle)
    .exhaustive();

  const options: ExternalToast = {
    duration: status === 'error' ? Infinity : 3000,
  };

  toast.custom(
    (t) => (
      <Flex>
        <IconButton
          zIndex={1}
          size="xs"
          aria-label={i18n.t('components:toast.closeToast')}
          icon={<LuX />}
          onClick={() => toast.dismiss(t)}
          position="absolute"
          top={-2.5}
          right={-2.5}
          borderRadius="full"
        />
        <Card
          w="356px"
          position="relative"
          overflow="hidden"
          boxShadow="layout"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            w="3px"
            bg={`${status}.600`}
          />
          <CardBody
            display="flex"
            flexDirection="column"
            gap={1.5}
            p={4}
            color="gray.800"
            _dark={{
              color: 'white',
            }}
          >
            <Flex alignItems="center" gap={2}>
              <Heading size="xs" flex={1}>
                {!params.hideIcon && (
                  <Icon
                    icon={icon}
                    mr={2}
                    fontSize="1.2em"
                    color={`${status}.500`}
                  />
                )}
                {params.title}
              </Heading>
              {!!params.actions && (
                <ButtonGroup size="xs">{params.actions}</ButtonGroup>
              )}
            </Flex>
            {!!params.description && (
              <Flex
                direction="column"
                fontSize="xs"
                color="gray.600"
                _dark={{ color: 'gray.400' }}
              >
                {params.description}
              </Flex>
            )}
          </CardBody>
        </Card>
      </Flex>
    ),
    options
  );
};

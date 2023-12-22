import { ReactNode } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Flex,
  FlexProps,
  Skeleton,
  Stack,
  Text,
  TextProps,
  Wrap,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuRefreshCw } from 'react-icons/lu';

export type DataListProps = FlexProps;

export const DataList = (props: DataListProps) => {
  return (
    <Flex
      flexDirection="column"
      position="relative"
      boxShadow="card"
      borderRadius="md"
      overflowX="auto"
      overflowY="hidden"
      minH="10rem"
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      {...props}
      _dark={{
        bg: 'gray.800',
        borderColor: 'gray.900',
        ...props._dark,
      }}
    />
  );
};

export type DataListRowProps = FlexProps & { withHover?: boolean };

export const DataListRow = ({ withHover, ...props }: DataListRowProps) => {
  return (
    <Flex
      borderBottom="1px solid"
      borderBottomColor="gray.100"
      transition="0.2s"
      px={1.5}
      {...props}
      _last={{
        // Hide bottom border, if the row is at the bottom of the DataList
        mb: '-1px',
        ...props._last,
      }}
      _hover={{
        ...(withHover
          ? { bg: 'gray.50', _dark: { bg: 'whiteAlpha.100' } }
          : {}),
        ...props._hover,
      }}
      _dark={{
        borderBottomColor: 'gray.900',
        ...props._dark,
      }}
    />
  );
};

export type DataListCellProps = FlexProps;

export const DataListCell = (props: DataListCellProps) => {
  const isFluid = props.w === undefined && props.width === undefined;

  return (
    <Flex
      flexDirection="column"
      minW={0}
      flex={isFluid ? 1 : undefined}
      py="2"
      px="1.5"
      align="flex-start"
      justifyContent="center"
      {...props}
    >
      {props.children}
    </Flex>
  );
};

export type DataListTextHeaderProps = DataListTextProps;

export const DataListTextHeader = (props: DataListTextHeaderProps) => {
  return (
    <DataListText
      fontWeight="bold"
      fontSize="xs"
      color="text-dimmed"
      {...props}
    >
      {props.children}
    </DataListText>
  );
};

export type DataListTextProps = TextProps;

export const DataListText = (props: DataListTextProps) => {
  return <Text as="div" fontSize="sm" maxW="full" noOfLines={1} {...props} />;
};

export const DataListLoadingState = () => {
  return (
    <>
      <DataListRow>
        <DataListCell>
          <Stack w="full" opacity={0.6} p={2}>
            <Skeleton w="30%" h={2} noOfLines={1} />
            <Skeleton w="20%" h={2} noOfLines={1} />
          </Stack>
        </DataListCell>
      </DataListRow>
      <DataListRow>
        <DataListCell>
          <Stack w="full" opacity={0.4} p={2}>
            <Skeleton w="30%" h={2} noOfLines={1} />
            <Skeleton w="20%" h={2} noOfLines={1} />
          </Stack>
        </DataListCell>
      </DataListRow>
      <DataListRow>
        <DataListCell>
          <Stack w="full" opacity={0.2} p={2}>
            <Skeleton w="30%" h={2} noOfLines={1} />
            <Skeleton w="20%" h={2} noOfLines={1} />
          </Stack>
        </DataListCell>
      </DataListRow>
    </>
  );
};

export type DataListEmptyStateProps = {
  children?: ReactNode;
  searchTerm?: string;
};

export const DataListEmptyState = (props: DataListEmptyStateProps) => {
  const { t } = useTranslation(['components']);
  return (
    <DataListRow flex={1}>
      <DataListCell
        flex={1}
        justifyContent="center"
        alignItems="center"
        fontSize="sm"
        fontWeight="semibold"
        color="text-dimmed"
      >
        {props.searchTerm ? (
          <Box>
            {t('components:datalist.noResultsTitle', {
              searchTerm: props.searchTerm,
            })}
          </Box>
        ) : (
          props.children ?? <Box>{t('components:datalist.emptyTitle')}</Box>
        )}
      </DataListCell>
    </DataListRow>
  );
};

export type DataListErrorStateProps = {
  title?: ReactNode;
  children?: ReactNode;
  retry?: () => void;
};

export const DataListErrorState = (props: DataListErrorStateProps) => {
  const { t } = useTranslation(['components']);
  return (
    <DataListRow>
      <DataListCell>
        <Alert status="error">
          <AlertTitle>
            {props.title ?? t('components:datalist.errorTitle')}
          </AlertTitle>
          {(!!props.children || !!props.retry) && (
            <AlertDescription>
              <Wrap spacingX={2} spacingY={1}>
                {!!props.children && (
                  <Box alignSelf="center">{props.children}</Box>
                )}
                {!!props.retry && (
                  <Button
                    colorScheme="error"
                    variant="ghost"
                    size="sm"
                    leftIcon={<LuRefreshCw />}
                    onClick={() => props.retry?.()}
                  >
                    {t('components:datalist.retry')}
                  </Button>
                )}
              </Wrap>
            </AlertDescription>
          )}
        </Alert>
      </DataListCell>
    </DataListRow>
  );
};

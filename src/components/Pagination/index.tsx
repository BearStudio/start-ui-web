import React, { useCallback, useContext, FC } from 'react';

import {
  Box,
  HStack,
  Icon,
  IconButton,
  IconButtonProps,
  Spinner,
} from '@chakra-ui/react';
import {
  CaretDoubleLeft,
  CaretDoubleRight,
  CaretLeft,
  CaretRight,
} from 'phosphor-react';

import { useSearchParams } from '@/app/router';

export const usePaginationFromUrl = () => {
  const { searchParams, setSearchParams } = useSearchParams();
  const page = +(searchParams.get('page') ?? 1);
  const setPage = useCallback(
    (p) => {
      const newPage = Math.max(1, p);
      setSearchParams('page', `${newPage}`);
    },
    [setSearchParams]
  );
  return { page, setPage };
};

export const getPaginationInfo = ({
  page = 1,
  pageSize = 10,
  totalItems = 0,
}) => {
  const firstItemOnPage = (page - 1) * pageSize + 1;
  const lastItemOnPage = Math.min(
    (page - 1) * pageSize + pageSize,
    totalItems ?? 0
  );
  const isFirstPage = firstItemOnPage <= 1;
  const isLastPage = lastItemOnPage >= totalItems;
  const firstPage = 1;
  const lastPage = Math.ceil(totalItems / pageSize);

  return {
    firstPage,
    lastPage,
    firstItemOnPage,
    lastItemOnPage,
    isFirstPage,
    isLastPage,
  };
};

export const PaginationContext = React.createContext(null);

export const PaginationButtonFirstPage: FC<Omit<
  IconButtonProps,
  'aria-label'
>> = ({ children, ...rest }) => {
  const { setPage, firstPage, isFirstPage } = useContext(PaginationContext);
  return (
    <IconButton
      onClick={() => setPage(firstPage)}
      aria-label="First page"
      icon={<Icon as={CaretDoubleLeft} fontSize="1.5em" />}
      size="sm"
      isDisabled={isFirstPage}
      {...rest}
    />
  );
};

export const PaginationButtonPrevPage: FC<Omit<
  IconButtonProps,
  'aria-label'
>> = ({ children, ...rest }) => {
  const { setPage, page, isFirstPage } = useContext(PaginationContext);
  return (
    <IconButton
      onClick={() => setPage(page - 1)}
      aria-label="Next page"
      icon={<Icon as={CaretLeft} fontSize="1.5em" />}
      size="sm"
      isDisabled={isFirstPage}
      {...rest}
    />
  );
};

export const PaginationButtonLastPage: FC<Omit<
  IconButtonProps,
  'aria-label'
>> = ({ children, ...rest }) => {
  const { setPage, lastPage, isLastPage } = useContext(PaginationContext);
  return (
    <IconButton
      onClick={() => setPage(lastPage)}
      aria-label="Last page"
      icon={<Icon as={CaretDoubleRight} fontSize="1.5em" />}
      size="sm"
      isDisabled={isLastPage}
      {...rest}
    />
  );
};

export const PaginationButtonNextPage: FC<Omit<
  IconButtonProps,
  'aria-label'
>> = ({ children, ...rest }) => {
  const { setPage, page, isLastPage } = useContext(PaginationContext);
  return (
    <IconButton
      onClick={() => setPage(page + 1)}
      aria-label="Previous page"
      icon={<Icon as={CaretRight} fontSize="1.5em" />}
      size="sm"
      isDisabled={isLastPage}
      {...rest}
    />
  );
};

export const PaginationInfo = ({ ...rest }) => {
  const {
    firstItemOnPage,
    lastItemOnPage,
    totalItems,
    isLoadingPage,
  } = useContext(PaginationContext);
  return (
    <HStack
      spacing="1"
      align="center"
      textAlign="center"
      justify="center"
      {...rest}
    >
      {isLoadingPage ? (
        <>
          <Spinner size="xs" mr="1" />
          <Box as="span" d={{ base: 'none', sm: 'inline' }}>
            Loading
          </Box>
        </>
      ) : (
        <Box as="span" d={{ base: 'none', sm: 'inline' }}>
          Showing
        </Box>
      )}
      <strong>{firstItemOnPage}</strong>
      <span>to</span>
      <strong>{lastItemOnPage}</strong>
      <span>of</span>
      <strong>{totalItems}</strong>
      <Box as="span" d={{ base: 'none', sm: 'inline' }}>
        results
      </Box>
    </HStack>
  );
};

export const Pagination = ({
  setPage,
  page = 1,
  pageSize = 10,
  totalItems = 0,
  isLoadingPage = false,
  ...rest
}) => {
  const pagination = getPaginationInfo({ page, pageSize, totalItems });
  return (
    <PaginationContext.Provider
      value={{
        setPage,
        page,
        pageSize,
        totalItems,
        isLoadingPage,
        ...pagination,
      }}
    >
      <HStack w="full" {...rest} />
    </PaginationContext.Provider>
  );
};

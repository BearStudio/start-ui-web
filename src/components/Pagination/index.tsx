import React, { useContext, FC } from 'react';

import {
  Box,
  HStack,
  IconButton,
  IconButtonProps,
  Spinner,
} from '@chakra-ui/react';
import { Trans, useTranslation } from 'react-i18next';
import {
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

import { Icon } from '@/components';
import { useRtl } from '@/hooks/useRtl';

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

export const PaginationButtonFirstPage: FC<
  Omit<IconButtonProps, 'aria-label'>
> = ({ ...rest }) => {
  const { rtlValue } = useRtl();
  const { t } = useTranslation();
  const { setPage, firstPage, isFirstPage } = useContext(PaginationContext);
  return (
    <IconButton
      onClick={() => setPage(firstPage)}
      aria-label={t('components:pagination.firstPage')}
      icon={
        <Icon icon={rtlValue(FiChevronsLeft, FiChevronsRight)} fontSize="lg" />
      }
      size="sm"
      isDisabled={isFirstPage}
      {...rest}
    />
  );
};

export const PaginationButtonPrevPage: FC<
  Omit<IconButtonProps, 'aria-label'>
> = ({ ...rest }) => {
  const { rtlValue } = useRtl();
  const { t } = useTranslation();
  const { setPage, page, isFirstPage } = useContext(PaginationContext);
  return (
    <IconButton
      onClick={() => setPage(page - 1)}
      aria-label={t('components:pagination.prevPage')}
      icon={
        <Icon icon={rtlValue(FiChevronLeft, FiChevronRight)} fontSize="lg" />
      }
      size="sm"
      isDisabled={isFirstPage}
      {...rest}
    />
  );
};

export const PaginationButtonLastPage: FC<
  Omit<IconButtonProps, 'aria-label'>
> = ({ ...rest }) => {
  const { rtlValue } = useRtl();
  const { t } = useTranslation();
  const { setPage, lastPage, isLastPage } = useContext(PaginationContext);
  return (
    <IconButton
      onClick={() => setPage(lastPage)}
      aria-label={t('components:pagination.lastPage')}
      icon={
        <Icon icon={rtlValue(FiChevronsRight, FiChevronsLeft)} fontSize="lg" />
      }
      size="sm"
      isDisabled={isLastPage}
      {...rest}
    />
  );
};

export const PaginationButtonNextPage: FC<
  Omit<IconButtonProps, 'aria-label'>
> = ({ ...rest }) => {
  const { rtlValue } = useRtl();
  const { t } = useTranslation();
  const { setPage, page, isLastPage } = useContext(PaginationContext);
  return (
    <IconButton
      onClick={() => setPage(page + 1)}
      aria-label={t('components:pagination.nextPage')}
      icon={
        <Icon icon={rtlValue(FiChevronRight, FiChevronLeft)} fontSize="lg" />
      }
      size="sm"
      isDisabled={isLastPage}
      {...rest}
    />
  );
};

export const PaginationInfo = ({ ...rest }) => {
  const { t } = useTranslation();
  const {
    firstItemOnPage,
    lastItemOnPage,
    totalItems,
    isLoadingPage,
  } = useContext(PaginationContext);
  const translationProps = {
    t,
    values: {
      firstItemOnPage,
      lastItemOnPage,
      totalItems,
    },
    components: {
      span: <span />,
      box: <Box as="span" d={{ base: 'none', sm: 'inline' }} />,
      spinner: <Spinner size="xs" me="1" />,
    },
  };
  return (
    <HStack
      spacing="1"
      align="center"
      textAlign="center"
      justify="center"
      {...rest}
    >
      {isLoadingPage ? (
        <Trans i18nKey="components:pagination.loading" {...translationProps} />
      ) : (
        <Trans i18nKey="components:pagination.showing" {...translationProps} />
      )}
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

import React, { useContext, useState, useEffect, useRef, FC } from 'react';

import { Flex, FlexProps, useBreakpointValue } from '@chakra-ui/react';

export const DataListContext = React.createContext(null);
export const DataListHeaderContext = React.createContext(null);

export interface DataListCellProps extends FlexProps {
  to?: any; // Prevent TS error with as={Link}
  colName?: string;
  colWidth?: string | Record<string, string>;
  isVisible?: boolean | boolean[] | Record<string, boolean>;
}

export const DataListCell: FC<DataListCellProps> = ({
  colName = null,
  colWidth = '100%',
  isVisible = true,
  ...rest
}) => {
  const { columns, setColumns } = useContext(DataListContext);
  const isInHeader = useContext(DataListHeaderContext);
  const restRef = useRef<any>();
  restRef.current = rest;

  useEffect(() => {
    if (isInHeader && colName) {
      setColumns((prevColumns) => ({
        ...prevColumns,
        [colName]: { colWidth, isVisible, ...restRef.current },
      }));
    }
  }, [isInHeader, colName, colWidth, isVisible, setColumns]);

  const headerProps = !isInHeader ? columns?.[colName] || {} : {};
  const {
    isVisible: _isVisible = true,
    colWidth: _colWidth = true,
    ...cellProps
  } = {
    colWidth,
    isVisible,
    ...headerProps,
    ...rest,
  };

  const showCell = useBreakpointValue(
    typeof _isVisible === 'object' ? _isVisible : { base: _isVisible }
  );
  if (!showCell) return null;
  return (
    <Flex
      direction="column"
      minW={
        typeof _colWidth === 'string' && !_colWidth.endsWith('%')
          ? _colWidth
          : 0
      }
      flexBasis={_colWidth}
      py="2"
      px="3"
      align="flex-start"
      justifyContent="center"
      {...cellProps}
    />
  );
};

export interface DataListRowProps extends FlexProps {
  isVisible?: boolean | boolean[] | Record<string, boolean>;
  isDisabled?: boolean;
}

export const DataListRow: FC<DataListRowProps> = ({
  isVisible = true,
  isDisabled = false,
  ...rest
}) => {
  const { isHover } = useContext(DataListContext);
  const showRow = useBreakpointValue(
    typeof isVisible === 'object' ? isVisible : { base: isVisible }
  );
  const disabledProps: any = isDisabled
    ? {
        bg: 'gray.50',
        opacity: 0.5,
        pointerEvents: 'none',
        _hover: {},
        _focus: {},
        'aria-disabled': true,
      }
    : {};
  return (
    <Flex
      d={!showRow ? 'none' : null}
      position="relative"
      borderBottom="1px solid"
      borderBottomColor="gray.200"
      transition="0.2s"
      _last={{ borderBottom: 'none' }}
      _hover={isHover ? { bg: 'gray.50' } : null}
      {...disabledProps}
      {...rest}
    />
  );
};

export interface DataListHeaderProps extends DataListRowProps {}

export const DataListHeader: FC<DataListHeaderProps> = ({ ...rest }) => {
  return (
    <DataListHeaderContext.Provider value={true}>
      <DataListRow
        bg="gray.100"
        fontSize="sm"
        fontWeight="bold"
        color="gray.600"
        _hover={{}}
        {...rest}
      />
    </DataListHeaderContext.Provider>
  );
};

export const DataListFooter = ({ ...rest }) => {
  return (
    <Flex
      mt="auto"
      bg="white"
      fontSize="sm"
      color="gray.600"
      p="2"
      align="center"
      {...rest}
    />
  );
};

export interface DataListProps extends FlexProps {
  isHover?: boolean;
}

export const DataList: FC<DataListProps> = ({
  children,
  isHover = true,
  ...rest
}) => {
  const [columns, setColumns] = useState({});
  return (
    <DataListContext.Provider
      value={{
        setColumns,
        columns,
        isHover,
      }}
    >
      <Flex
        direction="column"
        bg="white"
        position="relative"
        boxShadow="md"
        borderRadius="md"
        overflowX="auto"
        overflowY="hidden"
        minH="10rem"
        {...rest}
      >
        {children}
      </Flex>
    </DataListContext.Provider>
  );
};

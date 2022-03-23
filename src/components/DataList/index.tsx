import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AccordionProps,
  Box,
  Flex,
  FlexProps,
  useBreakpointValue,
} from '@chakra-ui/react';

import { useDarkMode } from '@/hooks/useDarkMode';

type DataListColumns = Record<string, DataListCellProps>;
type DataListContextValue = {
  setColumns: React.Dispatch<React.SetStateAction<DataListColumns>>;
  columns: DataListColumns;
  isHover: boolean;
};
type DataListHeaderContextValue = boolean;

export const DataListContext = React.createContext<DataListContextValue>(
  {} as TODO
);
export const DataListHeaderContext =
  React.createContext<DataListHeaderContextValue>(false);

export type DataListCellProps = FlexProps & {
  colName?: string;
  colWidth?: string | number | Record<string, string | number>;
  isVisible?: boolean | boolean[] | Record<string, boolean>;
};

export const DataListCell = ({
  children,
  colName,
  colWidth = 1,
  isVisible = true,
  ...rest
}: DataListCellProps) => {
  const { columns, setColumns } = useContext(DataListContext);
  const isInHeader = useContext(DataListHeaderContext);
  const restRef = useRef(rest);
  restRef.current = rest;

  useEffect(() => {
    if (isInHeader && colName) {
      setColumns((prevColumns) => ({
        ...prevColumns,
        [colName]: { colWidth, isVisible, ...restRef.current },
      }));
    }
  }, [isInHeader, colName, colWidth, isVisible, setColumns]);

  const headerProps = !isInHeader ? columns?.[colName ?? ''] ?? {} : {};
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

  const cellWidth =
    useBreakpointValue(
      typeof _colWidth === 'object' ? _colWidth : { base: _colWidth }
    ) ?? 0;

  if (!showCell) return null;

  const isWidthUnitless = /^[0-9.]+$/.test(String(cellWidth));

  return (
    <Flex
      direction="column"
      minW={!isWidthUnitless ? String(cellWidth) : 0}
      flexBasis={
        isWidthUnitless ? `${Number(cellWidth) * 100}%` : String(cellWidth)
      }
      py="2"
      px="3"
      align="flex-start"
      justifyContent="center"
      {...cellProps}
    >
      {children}
    </Flex>
  );
};

export const DataListAccordion = ({ ...rest }) => {
  return <AccordionItem border="none" {...rest} />;
};

export const DataListAccordionButton = ({ ...rest }) => {
  return (
    <AccordionButton
      role="group"
      p="0"
      textAlign="left"
      _focus={{ outline: 'none' }}
      _hover={{}}
      {...rest}
    />
  );
};

export const DataListAccordionIcon = ({ ...rest }) => {
  return (
    <AccordionIcon
      borderRadius="full"
      _groupFocus={{ boxShadow: 'outline' }}
      {...rest}
    />
  );
};

export const DataListAccordionPanel = ({ ...rest }) => {
  const { colorModeValue } = useDarkMode();
  return (
    <AccordionPanel
      boxShadow="inner"
      px="4"
      py="3"
      bg={colorModeValue('gray.50', 'blackAlpha.400')}
      {...rest}
    />
  );
};

export type DataListRowProps = FlexProps & {
  isVisible?: boolean | boolean[] | Record<string, boolean>;
  isDisabled?: boolean;
};

export const DataListRow: FC<DataListRowProps> = ({
  isVisible = true,
  isDisabled = false,
  ...rest
}) => {
  const { colorModeValue } = useDarkMode();
  const { isHover } = useContext(DataListContext);
  const showRow = useBreakpointValue(
    typeof isVisible === 'object' ? isVisible : { base: isVisible }
  );
  const disabledProps = isDisabled
    ? {
        bg: colorModeValue('gray.50', 'whiteAlpha.50'),
        _hover: {},
        _focus: {},
        'aria-disabled': true,
        opacity: '1 !important',
        css: {
          '> *': {
            opacity: 0.3,
          },
        },
      }
    : {};
  return (
    <Flex
      d={!showRow ? 'none' : undefined}
      position="relative"
      borderBottom="1px solid"
      borderBottomColor={colorModeValue('gray.100', 'gray.900')}
      transition="0.2s"
      _hover={
        isHover
          ? { bg: colorModeValue('gray.50', 'blackAlpha.200') }
          : undefined
      }
      {...disabledProps}
      {...rest}
    />
  );
};

export type DataListHeaderProps = DataListRowProps;

export const DataListHeader: FC<DataListHeaderProps> = ({ ...rest }) => {
  const { colorModeValue } = useDarkMode();
  return (
    <DataListHeaderContext.Provider value={true}>
      <DataListRow
        bg={colorModeValue('gray.100', 'blackAlpha.400')}
        fontSize="sm"
        fontWeight="bold"
        color={colorModeValue('gray.600', 'gray.300')}
        border="none"
        _hover={{}}
        {...rest}
      />
    </DataListHeaderContext.Provider>
  );
};

export type DataListFooterProps = DataListRowProps;

export const DataListFooter: FC<DataListFooterProps> = ({ ...rest }) => {
  const { colorModeValue } = useDarkMode();
  return (
    <Box mt="auto">
      <Flex
        bg={colorModeValue('white', 'blackAlpha.50')}
        fontSize="sm"
        color={colorModeValue('gray.600', 'gray.300')}
        mt="-1px"
        borderTop="1px solid"
        borderTopColor={colorModeValue('gray.100', 'gray.900')}
        p="2"
        align="center"
        {...rest}
      />
    </Box>
  );
};

export type DataListProps = AccordionProps & {
  isHover?: boolean;
};

export const DataList: FC<DataListProps> = ({
  allowMultiple = true,
  allowToggle = false,
  isHover = true,
  ...rest
}) => {
  const { colorModeValue } = useDarkMode();
  const [columns, setColumns] = useState<DataListColumns>({});
  return (
    <DataListContext.Provider
      value={{
        setColumns,
        columns,
        isHover,
      }}
    >
      <Accordion
        display="flex"
        flexDirection="column"
        bg={colorModeValue('white', 'blackAlpha.400')}
        position="relative"
        boxShadow="md"
        borderRadius="md"
        overflowX="auto"
        overflowY="hidden"
        minH="10rem"
        allowMultiple={allowMultiple && !allowToggle}
        allowToggle={allowToggle}
        {...rest}
      />
    </DataListContext.Provider>
  );
};

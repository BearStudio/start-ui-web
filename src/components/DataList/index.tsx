import React, { useContext, useState, useEffect, useRef, FC } from 'react';

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Flex,
  useBreakpointValue,
  FlexProps,
  AccordionProps,
  ChakraComponent,
} from '@chakra-ui/react';

import { useDarkMode } from '@/hooks/useDarkMode';

export const DataListContext = React.createContext(null);
export const DataListHeaderContext = React.createContext(null);

export interface DataListCellProps extends FlexProps {
  colName?: string;
  colWidth?: string | number | Record<string, string | number>;
  isVisible?: boolean | boolean[] | Record<string, boolean>;
}

export const DataListCell: ChakraComponent<'div', DataListCellProps> = ({
  children,
  colName = null,
  colWidth = 1,
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

  const cellWidth = useBreakpointValue(
    typeof _colWidth === 'object' ? _colWidth : { base: _colWidth }
  );

  if (!showCell) return null;

  const isWidthUnitless = /^[0-9.]+$/.test(cellWidth);

  return (
    <Flex
      direction="column"
      minW={!isWidthUnitless ? cellWidth : 0}
      flexBasis={isWidthUnitless ? `${+cellWidth * 100}%` : cellWidth}
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

export interface DataListRowProps extends FlexProps {
  isVisible?: boolean | boolean[] | Record<string, boolean>;
  isDisabled?: boolean;
}

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
  const disabledProps: any = isDisabled
    ? {
        bg: colorModeValue('gray.50', 'whiteAlpha.50'),
        pointerEvents: 'none',
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
      d={!showRow ? 'none' : null}
      position="relative"
      borderBottom="1px solid"
      borderBottomColor={colorModeValue('gray.100', 'gray.900')}
      transition="0.2s"
      _hover={
        isHover ? { bg: colorModeValue('gray.50', 'blackAlpha.200') } : null
      }
      {...disabledProps}
      {...rest}
    />
  );
};

export interface DataListHeaderProps extends DataListRowProps {}

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

export interface DataListFooterProps extends DataListRowProps {}

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

export interface DataListProps extends AccordionProps {
  isHover?: boolean;
}

export const DataList: FC<DataListProps> = ({
  allowMultiple = true,
  allowToggle = false,
  isHover = true,
  ...rest
}) => {
  const { colorModeValue } = useDarkMode();
  const [columns, setColumns] = useState({});
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

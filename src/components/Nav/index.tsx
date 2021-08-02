import React, { FC, useEffect, useMemo, useState } from 'react';

import {
  Text,
  Flex,
  Stack,
  StackProps,
  FlexProps,
  useBreakpointValue,
  Menu,
  Button,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  ChakraComponent,
  Portal,
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

import { Icon } from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

const NavContext = React.createContext(null);
const useNavContext = () => React.useContext(NavContext);

interface NavProps extends StackProps {
  breakpoint?: string;
}

export const Nav: ChakraComponent<'div', NavProps> = ({
  children,
  breakpoint = 'lg',
  ...rest
}) => {
  const isMenu = useBreakpointValue({ base: true, [breakpoint]: false });
  const [active, setActive] = useState(<>-</>);
  return (
    <NavContext.Provider value={{ active, setActive, isMenu }}>
      <Menu matchWidth {...rest}>
        {!isMenu && <Stack spacing="1">{children}</Stack>}
        {isMenu && (
          <>
            <MenuButton
              textAlign="left"
              as={Button}
              rightIcon={<FiChevronDown />}
              sx={{ '> *': { minW: 0 } }}
            >
              {active}
            </MenuButton>
            <Portal>
              <MenuList>{children}</MenuList>
            </Portal>
          </>
        )}
      </Menu>
    </NavContext.Provider>
  );
};

interface NavItemProps extends FlexProps {
  icon?: any;
  isActive?: boolean;
}

export const NavItem: ChakraComponent<'span', NavItemProps> = ({
  children,
  icon,
  isActive = false,
  ...rest
}) => {
  const { colorModeValue } = useDarkMode();

  const { setActive, isMenu } = useNavContext();
  const Item: any = isMenu ? MenuItem : Flex;

  const itemContent = useMemo(
    () => (
      <Flex as="span" align="center" minW="0">
        {icon && (
          <Icon
            icon={icon}
            mt="0.05rem"
            me="2"
            fontSize="lg"
            color={
              isActive ? colorModeValue('brand.500', 'brand.300') : 'gray.400'
            }
          />
        )}
        <Text as="span" noOfLines={isMenu ? 1 : 2}>
          {children}
        </Text>
      </Flex>
    ),
    [icon, children, isActive, isMenu, colorModeValue]
  );

  useEffect(() => {
    if (isActive) {
      setActive(itemContent);
    }
  }, [isActive, setActive, itemContent]);

  return (
    <Item
      px="3"
      py="2"
      borderRadius={isMenu ? undefined : 'md'}
      transition="0.2s"
      color={
        isActive
          ? colorModeValue('gray.700', 'gray.100')
          : colorModeValue('gray.600', 'gray.300')
      }
      fontSize="sm"
      fontWeight="bold"
      bg={isActive ? colorModeValue('white', 'blackAlpha.300') : undefined}
      _hover={
        !isActive && !isMenu
          ? {
              bg: colorModeValue('white', 'blackAlpha.300'),
              color: colorModeValue('gray.700', 'gray.100'),
            }
          : {}
      }
      {...rest}
    >
      {itemContent}
    </Item>
  );
};

export const NavGroup: FC<FlexProps> = ({ children, title, ...rest }) => {
  const { colorModeValue } = useDarkMode();
  const { isMenu } = useNavContext();

  if (isMenu) {
    return (
      <MenuGroup title={title} {...rest}>
        {children}
      </MenuGroup>
    );
  }
  return (
    <Flex direction="column">
      <Flex
        fontSize="xs"
        fontWeight="bold"
        color={colorModeValue('gray.500', 'gray.300')}
        px="3"
        pt="6"
        pb="2"
        {...rest}
      >
        {title}
      </Flex>
      <Stack spacing="1">{children}</Stack>
    </Flex>
  );
};

import React, { FC, useContext, useEffect, useMemo, useState } from 'react';

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

const NavContext = React.createContext(null);

interface NavProps extends StackProps {
  breakpoint?: string;
}

export const Nav: ChakraComponent<'div', NavProps> = ({
  children,
  breakpoint = 'lg',
  ...rest
}) => {
  const isMenu = useBreakpointValue({ base: true, [breakpoint]: false });
  const [active, setActive] = useState(<>Navigation</>);
  return (
    <NavContext.Provider value={{ active, setActive }}>
      <Menu isLazy matchWidth {...rest}>
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
  const { setActive } = useContext(NavContext);
  const isMenu = useBreakpointValue({ base: true, lg: false });
  const Item: any = isMenu ? MenuItem : Flex;

  const itemContent = useMemo(
    () => (
      <Flex as="span" align="center" minW="0">
        {icon && (
          <Icon
            icon={icon}
            mt="0.05rem"
            mr="2"
            fontSize="lg"
            color={isActive ? 'brand.500' : 'gray.400'}
          />
        )}
        <Text as="span" noOfLines={isMenu ? 1 : 2}>
          {children}
        </Text>
      </Flex>
    ),
    [icon, children, isActive, isMenu]
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
      color={isActive ? 'gray.700' : 'gray.600'}
      fontSize="sm"
      fontWeight="bold"
      bg={isActive ? 'white' : undefined}
      _hover={!isActive && !isMenu ? { bg: 'white', color: 'gray.700' } : {}}
      {...rest}
    >
      {itemContent}
    </Item>
  );
};

export const NavGroup: FC<FlexProps> = ({ children, title, ...rest }) => {
  const isMenu = useBreakpointValue({ base: true, lg: false });
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
        color="gray.500"
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

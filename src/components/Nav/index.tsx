import React, { FC, useContext, useEffect, useMemo, useState } from 'react';

import {
  Text,
  Flex,
  Icon,
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
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

const NavContext = React.createContext(null);

interface NavProps extends StackProps {
  breakpoint?: string;
}

export const Nav: FC<NavProps> = ({ children, breakpoint = 'lg', ...rest }) => {
  const isMenu = useBreakpointValue({ base: true, [breakpoint]: false });
  const [active, setActive] = useState(<>Navigation</>);
  return (
    <NavContext.Provider value={{ active, setActive }}>
      <Menu {...rest}>
        {!isMenu && (
          <Stack spacing="0" {...rest}>
            {children}
          </Stack>
        )}
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
            <MenuList maxW="80vw">{children}</MenuList>
          </>
        )}
      </Menu>
    </NavContext.Provider>
  );
};

interface NavItemProps extends FlexProps {
  to?: any; // Prevent TS error with as={Link}
  icon?: any;
  isActive?: boolean;
}

export const NavItem: FC<NavItemProps> = ({
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
      <Flex as="span" align="flex-start" minW="0">
        {icon && (
          <Icon
            as={icon as any}
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
    return <MenuGroup title={title}>{children}</MenuGroup>;
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
      {children}
    </Flex>
  );
};

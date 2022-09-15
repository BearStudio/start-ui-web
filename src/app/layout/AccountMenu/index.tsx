import React from 'react';

import {
  Avatar,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  useClipboard,
  useColorMode,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  FiCheck,
  FiCopy,
  FiLogOut,
  FiMoon,
  FiSun,
  FiUser,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import buildInfo from '@/../.build-info.json';
import { useAccount } from '@/app/account/account.service';
import { Icon } from '@/components/Icons';

const AppVersion = ({ ...rest }) => {
  const { t } = useTranslation();

  const { hasCopied, onCopy } = useClipboard(
    JSON.stringify(buildInfo, null, 2)
  );

  if (!buildInfo?.version) {
    return null;
  }

  return (
    <>
      <MenuDivider />
      <Flex
        role="group"
        as="button"
        position="relative"
        w="full"
        textAlign="left"
        py="2"
        px="3"
        my="-2"
        fontSize="0.7rem"
        fontWeight="medium"
        outline="none"
        color="gray.500"
        _hover={{ bg: 'gray.50' }}
        _focusVisible={{ bg: 'gray.50' }}
        _dark={{
          color: 'gray.200',
          _focusVisible: { bg: 'gray.800' },
          _hover: { bg: 'gray.600' },
        }}
        onClick={onCopy}
        {...rest}
      >
        <Flex
          display={hasCopied ? 'flex' : 'none'}
          position="absolute"
          align="center"
          top="0"
          insetStart="0"
          insetEnd="0"
          bottom="0"
          py="2"
          px="3"
          fontWeight="bold"
          bg="gray.50"
          color={hasCopied ? 'success.500' : undefined}
          _dark={{
            bg: 'gray.800',
            color: hasCopied ? 'success.300' : undefined,
          }}
          transition="0.2s"
          _groupHover={{ d: 'flex' }}
        >
          <Icon icon={hasCopied ? FiCheck : FiCopy} me="2" fontSize="sm" />
          {hasCopied
            ? t('layout:accountMenu.version.copied')
            : t('layout:accountMenu.version.copy')}
        </Flex>
        <Text as="span" noOfLines={2}>
          {t('layout:accountMenu.version.label')}{' '}
          <strong>{buildInfo?.display ?? buildInfo?.version}</strong>
        </Text>
      </Flex>
    </>
  );
};

export const AccountMenu = ({ ...rest }) => {
  const { t } = useTranslation('layout');

  const { colorMode, toggleColorMode } = useColorMode();
  const { account, isLoading } = useAccount();
  const navigate = useNavigate();

  return (
    <Menu placement="bottom-end" {...rest}>
      <MenuButton borderRadius="full" _focusVisible={{ shadow: 'outline' }}>
        <Avatar size="sm" icon={<></>} name={account?.login}>
          {isLoading && <Spinner size="xs" />}
        </Avatar>
      </MenuButton>
      <MenuList
        maxW="12rem"
        overflow="hidden"
        color="gray.800"
        _dark={{ color: 'white' }}
      >
        <MenuGroup title={account?.email} noOfLines={1}>
          <MenuItem
            as={Link}
            to="/account"
            icon={<Icon icon={FiUser} fontSize="lg" color="gray.400" />}
          >
            {t('layout:accountMenu.myAccount')}
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuItem
          icon={
            <Icon
              icon={colorMode === 'dark' ? FiSun : FiMoon}
              fontSize="lg"
              color="gray.400"
            />
          }
          onClick={() => toggleColorMode()}
        >
          {colorMode === 'dark'
            ? t('layout:accountMenu.switchColorModeLight')
            : t('layout:accountMenu.switchColorModeDark')}
        </MenuItem>
        <MenuDivider />
        <MenuItem
          icon={<Icon icon={FiLogOut} fontSize="lg" color="gray.400" />}
          onClick={() => navigate('/logout')}
        >
          {t('layout:accountMenu.logout')}
        </MenuItem>
        <AppVersion />
      </MenuList>
    </Menu>
  );
};

import React, { useRef, useState, useEffect } from 'react';

import {
  chakra,
  useMenuItem,
  MenuItemProps,
  MenuIcon,
  MenuCommand,
  forwardRef,
  HTMLChakraProps,
  useMenuState,
  useStyles,
  Text,
  Flex,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiAlertCircle } from 'react-icons/fi';

import { Icon } from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

export interface StyledMenuItemProps extends HTMLChakraProps<'button'> {}

const StyledMenuItem = forwardRef<StyledMenuItemProps, 'button'>(
  (props, ref) => {
    const { type, ...rest } = props;
    const styles = useStyles();

    /**
     * Given another component, use its type if present
     * Else, use no type to avoid invalid html, e.g. <a type="button" />
     * Else, fall back to "button"
     */
    const btnType = rest.as ? type ?? undefined : 'button';

    const buttonStyles: any = {
      textDecoration: 'none',
      color: 'inherit',
      userSelect: 'none',
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      textAlign: 'left',
      flex: '0 0 auto',
      outline: 0,
      ...styles.item,
    };

    return (
      <chakra.button ref={ref} type={btnType} {...rest} __css={buttonStyles} />
    );
  }
);

export const MenuItem = forwardRef<MenuItemProps, 'button'>((props, ref) => {
  const {
    icon,
    iconSpacing = '0.75rem',
    command,
    commandSpacing = '0.75rem',
    children,
    ...rest
  } = props;

  const menuItemProps = useMenuItem(rest, ref) as MenuItemProps;

  const shouldWrap = icon || command;

  const _children = shouldWrap ? (
    <chakra.span pointerEvents="none" flex="1">
      {children}
    </chakra.span>
  ) : (
    children
  );

  return (
    <StyledMenuItem
      {...menuItemProps}
      onClick={(e) => {
        rest?.onClick?.(e);
      }}
    >
      {icon && (
        <MenuIcon fontSize="0.8em" marginEnd={iconSpacing}>
          {icon}
        </MenuIcon>
      )}
      {_children}
      {command && (
        <MenuCommand marginStart={commandSpacing}>{command}</MenuCommand>
      )}
    </StyledMenuItem>
  );
});

interface ConfirmMenuItemProps extends MenuItemProps {
  confirmDelay?: number;
  confirmColorScheme?: string;
  confirmContent?: React.ReactNode;
  confirmText?: React.ReactNode;
  confirmIcon?: React.FC;
}

export const ConfirmMenuItem = forwardRef<ConfirmMenuItemProps, 'button'>(
  (
    {
      children,
      confirmColorScheme = 'error',
      confirmContent = '',
      confirmIcon = FiAlertCircle,
      confirmText,
      confirmDelay = 2000,
      icon,
      onClick,
      ...rest
    },
    ref
  ) => {
    const { t } = useTranslation();
    const { colorModeValue } = useDarkMode();
    const [isConfirmActive, setIsConfirmActive] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const { onClose: onCloseMenu } = useMenuState();

    const handleClickConfirm = (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      if (isConfirmActive) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        onClick?.(event);
        onCloseMenu();
        setIsConfirmActive(false);
      } else {
        setIsConfirmActive(true);
      }
    };

    useEffect(() => {
      if (isConfirmActive) {
        timeoutRef.current = setTimeout(() => {
          setIsConfirmActive(false);
        }, confirmDelay);
      }

      return () => {
        clearTimeout(timeoutRef.current);
      };
    }, [isConfirmActive, confirmDelay]);

    const confirmActiveProps = isConfirmActive
      ? {
          bg: `${confirmColorScheme}.${colorModeValue('100', '800')}`,
          color: 'transparent',
          transition: '0.2s',
          _hover: {
            bg: `${confirmColorScheme}.${colorModeValue('50', '900')}`,
          },
          _focus: {
            bg: `${confirmColorScheme}.${colorModeValue('50', '900')}`,
          },
          icon: icon
            ? React.cloneElement(icon, { color: 'transparent' })
            : icon,
        }
      : {};

    return (
      <MenuItem
        position="relative"
        onClick={handleClickConfirm}
        ref={ref}
        icon={icon}
        {...rest}
        {...confirmActiveProps}
      >
        <Flex
          as="span"
          alignItems="center"
          opacity={isConfirmActive ? 0 : undefined}
        >
          {children}
        </Flex>

        {isConfirmActive && (
          <Flex
            position="absolute"
            top={0}
            insetStart={0}
            insetEnd={0}
            bottom={0}
            px={3}
            as="span"
            color={colorModeValue(`${confirmColorScheme}.500`, 'white')}
            fontSize="sm"
            alignItems="center"
          >
            {confirmContent ? (
              confirmContent
            ) : (
              <>
                <Icon icon={confirmIcon} me={1} />{' '}
                <Text isTruncated as="span">
                  {confirmText ?? t('components:confirmMenuItem.confirmText')}
                </Text>
              </>
            )}
          </Flex>
        )}
      </MenuItem>
    );
  }
);

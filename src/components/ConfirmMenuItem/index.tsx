import React, { useEffect, useRef, useState } from 'react';

import {
  Flex,
  HTMLChakraProps,
  MenuCommand,
  MenuIcon,
  MenuItemProps,
  Text,
  chakra,
  createStylesContext,
  forwardRef,
  useMenuItem,
  useMenuState,
  useMultiStyleConfig,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuAlertCircle } from 'react-icons/lu';

import { Icon } from '@/components/Icons';

export type StyledMenuItemProps = HTMLChakraProps<'button'>;

const [StylesProvider, useStyles] = createStylesContext('Menu');

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

    const buttonStyles = {
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

  const styles = useMultiStyleConfig('Menu', props);

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
    <StylesProvider value={styles}>
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
    </StylesProvider>
  );
});

type ConfirmMenuItemProps = MenuItemProps & {
  confirmDelay?: number;
  confirmColorScheme?: string;
  confirmContent?: React.ReactNode;
  confirmText?: React.ReactNode;
  confirmIcon?: React.FC<React.PropsWithChildren<unknown>>;
};

export const ConfirmMenuItem = forwardRef<ConfirmMenuItemProps, 'button'>(
  (
    {
      children,
      confirmColorScheme = 'error',
      confirmContent = '',
      confirmIcon = LuAlertCircle,
      confirmText,
      confirmDelay = 2000,
      icon,
      onClick,
      ...rest
    },
    ref
  ) => {
    const { t } = useTranslation(['components']);

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
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [isConfirmActive, confirmDelay]);

    const confirmActiveProps = isConfirmActive
      ? {
          bg: `${confirmColorScheme}.100`,
          color: 'transparent',
          transition: '0.2s',
          _dark: {
            bg: `${confirmColorScheme}.800`,
          },
          _hover: {
            bg: `${confirmColorScheme}.50`,
            _dark: {
              bg: `${confirmColorScheme}.900`,
            },
          },
          _focusVisible: {
            bg: `${confirmColorScheme}.50`,
            _dark: {
              bg: `${confirmColorScheme}.900`,
            },
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
            fontSize="sm"
            alignItems="center"
            color={`${confirmColorScheme}.500`}
            _dark={{ color: 'white' }}
          >
            {confirmContent ? (
              confirmContent
            ) : (
              <>
                <Icon icon={confirmIcon} me={1} />{' '}
                <Text noOfLines={1} as="span">
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

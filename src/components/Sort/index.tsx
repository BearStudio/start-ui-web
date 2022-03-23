import { FC } from 'react';

import {
  Button,
  ButtonProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Portal,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { IconSortAsc, IconSortDesc } from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

type OptionProps = {
  value: string;
  label: string;
};

export type SortValue = {
  by: string;
  order: 'asc' | 'desc';
};

type CustomProps = {
  sort: SortValue;
  size?: 'xs' | 'sm' | 'md';
  options?: Array<OptionProps>;
  onChange?(sort: SortValue): void;
  ascIcon?: FC;
  descIcon?: FC;
};

type SortProps = Overwrite<ButtonProps, CustomProps>;

export const Sort: FC<SortProps> = ({
  sort = { by: '', order: 'asc' },
  size = 'xs',
  options = [],
  onChange = () => undefined,
  ascIcon: AscIcon = IconSortAsc,
  descIcon: DescIcon = IconSortDesc,
  ...rest
}) => {
  const { t } = useTranslation();
  const { colorMode } = useDarkMode();

  const { by, order } = sort;

  const Icon = order === 'asc' ? AscIcon : DescIcon;

  const handleByChange = (value: SortValue['by']) => {
    onChange({ ...sort, by: value });
  };

  const handleOrderChange = (value: SortValue['order']) => {
    onChange({ ...sort, order: value });
  };

  return (
    <Menu closeOnSelect={false} size={size}>
      <MenuButton
        as={Button}
        d="inline-block"
        variant="link"
        size={size}
        overflow="hidden"
        textAlign="left"
        p="1"
        color={colorMode === 'light' ? 'gray.600' : 'gray.100'}
        sx={{ '> span': { d: 'flex', maxW: 'full' } }}
        {...rest}
      >
        <Icon mr="0.5" />
        <Text as="span" d="block" fontSize={size} isTruncated>
          {options.find((option) => option?.value === by)?.label}
        </Text>
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuOptionGroup
            title={t('components:sort.sortBy')}
            type="radio"
            color={colorMode === 'light' ? 'gray.500' : 'gray.50'}
            fontWeight="medium"
            fontSize="xs"
            value={by}
            onChange={
              (value: string | string[]) => handleByChange(value as string) // type === radio, so value always be string
            }
          >
            {options?.map((option) => (
              <MenuItemOption
                key={option?.value}
                value={option?.value}
                color={colorMode === 'light' ? 'gray.600' : 'gray.100'}
                fontSize="sm"
              >
                {option?.label}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuOptionGroup
            value={order}
            title={t('components:sort.order')}
            type="radio"
            color={colorMode === 'light' ? 'gray.500' : 'gray.50'}
            fontWeight="medium"
            fontSize="xs"
            onChange={
              (value: string | string[]) =>
                handleOrderChange(value as SortValue['order']) // type === radio, so value always be "asc" or "desc"
            }
          >
            <MenuItemOption
              value="asc"
              color={colorMode === 'light' ? 'gray.600' : 'gray.100'}
              fontSize="sm"
            >
              {t('components:sort.sortAscending')}
            </MenuItemOption>
            <MenuItemOption
              value="desc"
              color={colorMode === 'light' ? 'gray.600' : 'gray.100'}
              fontSize="sm"
            >
              {t('components:sort.sortDescending')}
            </MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </Portal>
    </Menu>
  );
};

import React from 'react';

import { Stack } from '@chakra-ui/react';
import {
  isEmail,
  isMaxLength,
  isMinLength,
  isPattern,
} from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { FieldCheckboxes } from '@/components/FieldCheckboxes';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';

// import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE_KEY } from '@/constants/i18n';

export const AVAILABLE_LANGUAGES = [
  {
    key: 'drop ERC20 in wallet',
  },
  {
    key: 'drop ERC721 PFP NFT',
  },
  {
    key: 'drop POAP in wallet',
  },
  {
    key: 'send XMTP message to wallet',
  },
  {
    key: 'time bomb',
  },
  {
    key: 'gas fee refund',
  },
  {
    key: 'oracle unlock',
  },
  {
    key: 'birthday surprise',
  },
];

const AUTHORITIES = {
  refund: 'refund gas',
  store: 'multi-chain',
};

export const UserForm = () => {
  const { t } = useTranslation();

  const authorities = Object.values(AUTHORITIES).map((value) => ({ value }));
  return (
    <Stack
      direction="column"
      borderRadius="lg"
      spacing="6"
      shadow="md"
      bg="white"
      _dark={{ bg: 'gray.900' }}
      p="6"
    >
      <FieldInput
        name="login"
        label="Symbol"
        required="try an emoji!"
        placeholder="try an emoji!"
        validations={[
          {
            rule: isMinLength(2),
          },
          {
            rule: isMaxLength(50),
          },
        ]}
      />

      <FieldInput
        name="email"
        label="Conditions"
        placeholder="Rules to trigger"
        // required={t('users:data.email.required') as string}
        // validations={[
        //   {
        //     rule: isMinLength(5),
        //     message: t('users:data.email.tooShort', { min: 5 }),
        //   },
        //   {
        //     rule: isMaxLength(254),
        //     message: t('users:data.email.tooLong', { min: 254 }),
        //   },
        //   {
        //     rule: isEmail(),
        //     message: t('users:data.email.invalid'),
        //   },
        // ]}
      />
      <Stack direction={{ base: 'column', sm: 'row' }} spacing="6">
        <FieldInput
          name="firstName"
          label="➡️ To"
          placeholder="Wallet address"
        />
        <FieldInput
          name="lastName"
          label="⬅️ From"
          placeholder="Wallet address"
        />
      </Stack>
      <FieldSelect
        name="langKey"
        label="Reward"
        options={AVAILABLE_LANGUAGES.map(({ key }) => ({
          label: key,
          value: key,
        }))}
      />
      <FieldCheckboxes
        name="authorities"
        label="⚡️Actions"
        options={authorities}
        required="choose an action!"
      />
    </Stack>
  );
};

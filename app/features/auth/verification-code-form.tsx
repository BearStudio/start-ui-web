import { useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';

import { FormFieldsVerificationCode } from '@/features/auth/schemas';
import { VALIDATION_TOKEN_EXPIRATION_IN_MINUTES } from '@/features/auth/utils';

type VerificationCodeFormProps = {
  email: string;
  isLoading?: boolean;
  autoSubmit?: boolean;
};

export const VerificationCodeForm = ({
  email,
  isLoading,
  autoSubmit = true,
}: VerificationCodeFormProps) => {
  const { t } = useTranslation(['auth']);
  const form = useFormContext<FormFieldsVerificationCode>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1>{t('auth:validate.title')}</h1>
        <p className="text-sm">
          <Trans
            t={t}
            i18nKey="auth:validate.description"
            values={{
              email,
              expiration: VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
            }}
            components={{
              b: <strong />,
            }}
          />
        </p>
      </div>
      <FormField>
        <FormFieldLabel>{t('auth:data.verificationCode.label')}</FormFieldLabel>
        <FormFieldController
          type="otp"
          control={form.control}
          name="code"
          size="lg"
          maxLength={6}
          autoSubmit={autoSubmit}
          autoFocus
        />
        <FormFieldHelper>
          {t('auth:data.verificationCode.helper')}
        </FormFieldHelper>
      </FormField>
      <div className="flex gap-8">
        <Button size="lg" loading={isLoading} type="submit" className="flex-1">
          {t('auth:validate.actions.confirm')}
        </Button>
      </div>

      {/* <ValidationCodeHint /> TODO */}
    </div>
  );
};

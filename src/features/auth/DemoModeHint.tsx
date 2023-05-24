import { Alert, AlertDescription, Button } from '@chakra-ui/react';
import { useForm } from '@formiz/core';
import { Trans, useTranslation } from 'react-i18next';

export const DemoModeHint = () => {
  const { t } = useTranslation(['auth']);
  const form = useForm({ subscribe: 'form' });
  const mockedUsername = 'admin';
  const mockedPassword = 'admin';

  if (!process.env.NEXT_PUBLIC_IS_DEMO) return null;

  return (
    <Alert mt="4" borderRadius="md" textAlign="center" colorScheme="brand">
      <AlertDescription>
        <Trans
          t={t}
          i18nKey="auth:demoMode.loginHint"
          values={{ credentials: `${mockedUsername}/${mockedPassword}` }}
          components={{
            button: (
              <Button
                variant="link"
                color="inherit"
                onClick={() =>
                  form.setFieldsValues({
                    username: mockedUsername,
                    password: mockedPassword,
                  })
                }
              />
            ),
          }}
        />
      </AlertDescription>
    </Alert>
  );
};

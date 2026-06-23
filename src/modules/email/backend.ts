import { createServerOnlyFn } from '@tanstack/react-start';

import { appErrorToResponse } from '@/modules/kernel/transport/http/error-mapper';

import {
  createResendWebhookHandlers,
  type ResendWebhookHandlers,
} from './transport/http/resend-webhook-handlers';

type EmailServerRuntimeDeps = {
  handlers: ResendWebhookHandlers;
};

const getDeps = createServerOnlyFn(
  async (): Promise<EmailServerRuntimeDeps> => {
    const [
      { getEmailUseCases, getResendWebhookVerifier },
      { getKernel },
      { getEmailConfig },
    ] = await Promise.all([
      import('@/composition/email'),
      import('@/composition/kernel'),
      import('@/modules/kernel/infrastructure/config/email'),
    ]);

    return {
      handlers: createResendWebhookHandlers({
        getUseCases: getEmailUseCases,
        logger: getKernel().logger,
        maxBodyBytes: getEmailConfig().resendWebhookMaxBytes,
        verifier: getResendWebhookVerifier(),
      }),
    };
  }
);

export async function handleResendWebhookRequest(request: Request) {
  try {
    const { handlers } = await getDeps();
    return await handlers.receive(request);
  } catch (error) {
    return appErrorToResponse(error);
  }
}

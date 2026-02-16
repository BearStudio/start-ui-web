import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/errors/page-error';
import { Spinner } from '@/components/ui/spinner';

export function MailDevDevtoolPanel() {
  const devtoolsQuery = useQuery(orpc.config.devtools.queryOptions());

  const ui = getUiState((set) => {
    if (devtoolsQuery.status === 'pending') return set('pending');
    if (devtoolsQuery.status === 'error') return set('error');
    if (!devtoolsQuery.data.maildevIframeSrc) return set('unavailable');
    return set('default', {
      maildevIframeSrc: devtoolsQuery.data.maildevIframeSrc,
    });
  });

  return (
    <div className="flex h-full flex-1 flex-col">
      {ui
        .match('pending', () => <Spinner full />)
        .match('error', () => <PageError type="unknown" children="" />)
        .match('unavailable', () => (
          <PageError
            type="unknown"
            children=""
            errorCode="No URL"
            title="Unavailable"
            message="No maildev url available"
          />
        ))
        .match('default', (data) => (
          <iframe
            className="h-full w-full"
            src={data.maildevIframeSrc}
            // eslint-disable-next-line @eslint-react/dom/no-unsafe-iframe-sandbox
            sandbox="allow-same-origin allow-scripts"
          />
        ))
        .exhaustive()}
    </div>
  );
}

import { envClient } from '@/env/client';

export function MailDevDevtoolPanel() {
  return (
    <div className="h-full">
      <iframe
        className="h-full w-full"
        src={`http://localhost:${envClient.VITE_DOCKER_MAILDEV_UI_PORT}/#/`}
        // eslint-disable-next-line @eslint-react/dom/no-unsafe-iframe-sandbox
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}

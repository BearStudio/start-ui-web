export function MailDevDevtoolPanel() {
  const port = import.meta.env.VITE_DOCKER_MAILDEV_UI_PORT || '1080';
  return (
    <div className="h-full">
      <iframe
        className="h-full w-full"
        src={`http://localhost:${port}/#/`}
        // eslint-disable-next-line @eslint-react/dom/no-unsafe-iframe-sandbox
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}

export function MailDevDevtoolPanel() {
  return (
    <div className="h-full">
      <iframe
        className="h-full w-full"
        src="http://localhost:1080/#/"
        // eslint-disable-next-line @eslint-react/dom/no-unsafe-iframe-sandbox
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}

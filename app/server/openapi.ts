export const scalarUiResponse = ({
  title,
  schemaUrl,
}: {
  title: string;
  schemaUrl: string;
}) => {
  return new Response(
    `
    <!doctype html>
    <html>
      <head>
        <title>${title} | Open API</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <script
          id="api-reference"
          data-url="${schemaUrl}"
        ></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
};

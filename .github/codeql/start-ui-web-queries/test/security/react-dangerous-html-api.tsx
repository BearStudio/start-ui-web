declare const html: string;
declare const element: HTMLElement;
declare const code: string;

export function Dangerous() {
  element.innerHTML = html;
  element.insertAdjacentHTML('beforeend', html);
  eval(code); // eslint-disable-line security/detect-eval-with-expression -- Intentional CodeQL fixture.
  new Function(code);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export function SafeRead() {
  return element.innerHTML;
}

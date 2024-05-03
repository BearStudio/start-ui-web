import { forwardRef } from 'react';

// https://www.totaltypescript.com/forwardref-with-generic-components
// eslint-disable-next-line @typescript-eslint/ban-types
export function fixedForwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode
): (props: P & React.RefAttributes<T>) => React.ReactNode {
  return forwardRef(render) as ExplicitAny;
}

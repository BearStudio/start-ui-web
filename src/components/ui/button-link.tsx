import { Link, LinkProps } from '@tanstack/react-router';
import { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';

type ButtonLinkProps = Omit<
  ComponentProps<typeof Button>,
  'render' | 'nativeButton'
> &
  Omit<LinkProps, 'children'>;

function ButtonLink({
  // Link props
  to,
  params,
  search,
  hash,
  state,
  mask,
  from,
  reloadDocument,
  replace,
  resetScroll,
  viewTransition,
  ignoreBlocker,
  preload,
  preloadDelay,
  activeOptions,
  activeProps,
  inactiveProps,
  ...buttonProps
}: ButtonLinkProps) {
  return (
    <Button
      {...buttonProps}
      nativeButton={false}
      render={
        <Link
          to={to}
          params={params}
          search={search}
          hash={hash}
          state={state}
          mask={mask}
          from={from}
          reloadDocument={reloadDocument}
          replace={replace}
          resetScroll={resetScroll}
          viewTransition={viewTransition}
          ignoreBlocker={ignoreBlocker}
          preload={preload}
          preloadDelay={preloadDelay}
          activeOptions={activeOptions}
          activeProps={activeProps}
          inactiveProps={inactiveProps}
          disabled={buttonProps.disabled}
        />
      }
    />
  );
}

export { ButtonLink };

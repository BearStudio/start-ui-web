import { useLayoutEffect, useRef, useState } from 'react';

import {
  BrowserHistory,
  MemoryHistory,
  createBrowserHistory,
  createMemoryHistory,
} from 'history';
import { Router as ReactRouter, RouterProps } from 'react-router-dom';

const removeBasenameFromPathname = (basename: string, pathname: string) => {
  return pathname.replace(new RegExp(`^${basename}`, 'g'), '');
};

export const Router = ({
  basename,
  history,
  ...props
}: Partial<RouterProps> & { history: BrowserHistory | MemoryHistory }) => {
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  });

  const currentLocation = {
    ...state.location,
    pathname: removeBasenameFromPathname(
      basename ?? '',
      state.location.pathname
    ),
  };
  const currentLocationRef = useRef<Partial<Location> & { state: unknown }>(
    currentLocation
  );
  currentLocationRef.current = currentLocation;

  useLayoutEffect(
    () =>
      history.listen((ctx) => {
        setState({
          ...ctx,
          location: {
            ...ctx.location,
            state: {
              ...(ctx.location.state instanceof Object
                ? ctx.location.state
                : {}),
              __goBack:
                ctx.action === 'PUSH'
                  ? currentLocationRef.current
                  : (currentLocationRef.current.state as ExplicitAny)?.__goBack,
            },
          },
        });
      }),
    [history, basename]
  );

  return (
    <ReactRouter
      {...props}
      basename={basename}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
};

const browserHistory = createBrowserHistory({ window });
export const BrowserRouter = (props: Partial<RouterProps>) => {
  return <Router {...props} history={browserHistory} />;
};

const memoryHistory = createMemoryHistory();
export const MemoryRouter = (props: Partial<RouterProps>) => {
  return <Router {...props} history={memoryHistory} />;
};

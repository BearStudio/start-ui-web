type AvailableStatus =
  | 'pending'
  | 'not-found'
  | 'error'
  | 'empty-search'
  | 'empty'
  | 'default'
  | (string & {}); // Allows extra status

type UiState<
  Status extends AvailableStatus,
  Data extends Record<string, unknown>,
> = {
  with: <S extends Status>(
    status: S
  ) => {
    __status: S;
  };
  is: <S extends Status>(status: S) => boolean;
  state: {
    __status: Status;
  } & Data;
  match: <S extends Status>(
    status: Array<S>,
    handler: (data: Data) => React.ReactNode,
    __matched?: boolean,
    render?: () => React.ReactNode
  ) => UiState<Status, Data> & { render: () => React.ReactNode };
};

export const getUiState = <
  Status extends AvailableStatus,
  Data extends Record<string, unknown>,
>(
  getState: (
    set: <S extends AvailableStatus, D extends Record<string, unknown>>(
      status: S,
      data?: D
    ) => { __status: S } & D
  ) => { __status: Status } & Data
): UiState<Status, Data> => {
  const state = getState((status, data = {} as ExplicitAny) => {
    return {
      __status: status,
      ...data,
    };
  });

  const isMatching = <S extends Status>(
    status: Array<Status>
  ): status is Array<S> => status.includes(state.__status);

  const uiState: UiState<Status, Data> = {
    state,
    with: (status) => ({
      __status: status,
    }),
    is: (status) => {
      return state.__status === status;
    },
    match: (status, handler, __matched = false, render = () => null) => {
      if (!__matched && isMatching(status)) {
        return {
          ...uiState,
          __matched: true,
          render: () => handler(state),
          match: (status, _handler) =>
            uiState.match(status, _handler, true, () => handler(uiState.state)),
        };
      }

      return {
        ...uiState,
        __matched,
        render,
        match: (status, handler) =>
          uiState.match(status, handler, __matched, render),
      };
    },
  };

  return uiState;
};

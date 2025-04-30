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
  is: <S extends Status>(status: S) => boolean;
  state: {
    __status: Status;
  } & Data;
  match: <S extends Status>(
    status: S | Array<S>,
    handler: (
      data: Omit<
        Extract<UiState<Status, Data>['state'], { __status: S }>,
        '__status'
      >
    ) => React.ReactNode,
    __matched?: boolean,
    render?: () => React.ReactNode
  ) => Exclude<Status, S> extends never
    ? { render: () => React.ReactNode }
    : Pick<UiState<Exclude<Status, S>, Data>, 'match'>;
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

  const isMatching = <S extends Status>(status: Status): status is S =>
    status === state.__status;

  const isMatchingArray = <S extends Status>(
    status: Array<Status>
  ): status is Array<S> => status.includes(state.__status);

  const uiState: UiState<Status, Data> = {
    state,
    is: (status) => {
      return state.__status === status;
    },
    match: (status, handler, __matched = false, render = () => null) => {
      if (
        !__matched && typeof status === 'string'
          ? isMatching(status)
          : isMatchingArray(status as Array<Status>)
      ) {
        return {
          ...(uiState as ExplicitAny),
          __matched: true,
          render: () => handler(state as ExplicitAny),
          match: (status, _handler) =>
            uiState.match(status, _handler, true, () =>
              handler(uiState.state as ExplicitAny)
            ),
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

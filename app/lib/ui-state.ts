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
  match: <
    S extends Status,
    SData = Omit<
      Extract<UiState<Status, Data>['state'], { __status: S }>,
      '__status'
    >,
  >(
    status: S | Array<S>,
    handler: (
      data: SData
    ) => React.ReactNode | ((...args: ExplicitAny[]) => React.ReactNode),
    __matched?: boolean,
    render?: () =>
      | React.ReactNode
      | ((...args: ExplicitAny[]) => React.ReactNode)
  ) => {
    nonExhaustive: () => React.ReactNode;
  } & (Exclude<Status, S> extends never
    ? {
        exhaustive: () => React.ReactNode;
      }
    : Pick<UiState<Exclude<Status, S>, Data>, 'match'>);
};

export const getUiState = <
  Status extends AvailableStatus,
  Data extends Record<string, unknown>,
>(
  getState: (
    set: <S extends AvailableStatus, SData extends Record<string, unknown>>(
      status: S,
      data?: SData
    ) => { __status: S } & SData
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
        !__matched &&
        (typeof status === 'string'
          ? isMatching(status)
          : isMatchingArray(status as Array<Status>))
      ) {
        return {
          exhaustive: () => handler(state as ExplicitAny) as React.ReactNode,
          nonExhaustive: () => handler(state as ExplicitAny) as React.ReactNode,
          match: (status, _handler) =>
            uiState.match(status, _handler, true, () =>
              handler(uiState.state as ExplicitAny)
            ),
        };
      }

      return {
        exhaustive: render as () => React.ReactNode,
        nonExhaustive: render as () => React.ReactNode,
        match: (status, handler) =>
          uiState.match(status, handler, __matched, render),
      };
    },
  };

  return uiState;
};

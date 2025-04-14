type AvailableStatus =
  | 'pending'
  | 'not-found'
  | 'error'
  | 'empty-search'
  | 'empty'
  | 'default'
  | (string & {}); // Allows extra status

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
): {
  with: <S extends Status>(
    status: S
  ) => {
    __status: S;
  };
  is: <S extends Status>(status: S) => boolean;
  state: {
    __status: Status;
  } & Data;
} => {
  const state = getState((status, data = {} as ExplicitAny) => {
    return {
      __status: status,
      ...data,
    };
  });
  return {
    with: (status) => ({
      __status: status,
    }),
    is: (status) => {
      return state.__status === status;
    },
    state,
  };
};

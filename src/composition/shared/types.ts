export type Overrides<T> = {
  [K in keyof T]?: T[K];
};

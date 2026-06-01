export type TransactionIsolationLevel =
  | 'read uncommitted'
  | 'read committed'
  | 'repeatable read'
  | 'serializable';

export type TransactionAccessMode = 'read only' | 'read write';

export type TransactionOptions = {
  isolationLevel?: TransactionIsolationLevel;
  accessMode?: TransactionAccessMode;
  deferrable?: boolean;
};

export interface TransactionRunner<TTransaction = unknown> {
  run<T>(
    work: (transaction: TTransaction) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T>;
}

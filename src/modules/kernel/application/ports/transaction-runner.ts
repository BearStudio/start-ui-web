export interface TransactionRunner<TTransaction = unknown> {
  run<T>(work: (transaction: TTransaction) => Promise<T>): Promise<T>;
}

/**
 * This is the client-side entrypoint for your tRPC API.
 * We also create a few inference helpers for input and output types.
 */
import {
  createTRPCReact,
  inferReactQueryProcedureOptions,
} from '@trpc/react-query';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

import { type AppRouter } from '@/server/router';

/** A set of type-safe react-query hooks for your tRPC API. */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Inference helper for react query options.
 *
 * @example type HelloQueryOptions = ReactQueryOptions['example']['hello']
 */
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;

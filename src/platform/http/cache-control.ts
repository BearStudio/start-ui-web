/**
 * Safe defaults for HTTP `Cache-Control` headers on responses.
 *
 * Authenticated responses default to `private, no-store` so that intermediaries
 * and shared caches never replay one user's response to another. Public caching
 * is available only through the explicit `cachePublic()` helper, which makes
 * the security tradeoff obvious in code review.
 *
 * Apply via `setResponseHeader('Cache-Control', cachePrivateNoStore())` inside
 * server function or server route handlers.
 */

/**
 * Disables all storage and caching. Use for any response that depends on the
 * authenticated session or contains user-specific data.
 */
export const cachePrivateNoStore = (): string => 'private, no-store';

/**
 * Allows the browser (only) to cache the response for `maxAgeSeconds`. Always
 * includes `Vary: Cookie, Authorization` because the response varies per user.
 *
 * Returns both header values; the caller must set them both.
 */
export const cachePrivateShortLived = (
  maxAgeSeconds: number
): { cacheControl: string; vary: string } => {
  if (!Number.isFinite(maxAgeSeconds) || maxAgeSeconds < 0) {
    throw new Error('maxAgeSeconds must be a non-negative finite number');
  }
  return {
    cacheControl: `private, max-age=${Math.floor(maxAgeSeconds)}`,
    vary: 'Cookie, Authorization',
  };
};

/**
 * Cross-user (public/shared) cache. Only safe for responses that do not depend
 * on the session or the user. The doc explanation parameter is required so
 * reviewers can audit the reasoning at the call site.
 *
 * Example: `cachePublic({ maxAgeSeconds: 300, reason: 'static marketing copy' })`
 */
export const cachePublic = ({
  maxAgeSeconds,
  staleWhileRevalidateSeconds,
  reason,
}: {
  maxAgeSeconds: number;
  staleWhileRevalidateSeconds?: number;
  /**
   * Plain-text rationale recorded at the call site. Not emitted in the header;
   * this argument exists to force reviewers to justify every public-cache use.
   */
  reason: string;
}): string => {
  if (!reason || reason.trim().length === 0) {
    throw new Error(
      'cachePublic() requires an explicit reason explaining why the response is safe to share across users.'
    );
  }
  if (!Number.isFinite(maxAgeSeconds) || maxAgeSeconds < 0) {
    throw new Error('maxAgeSeconds must be a non-negative finite number');
  }
  const parts = [`public, max-age=${Math.floor(maxAgeSeconds)}`];
  if (
    typeof staleWhileRevalidateSeconds === 'number' &&
    staleWhileRevalidateSeconds >= 0
  ) {
    parts.push(
      `stale-while-revalidate=${Math.floor(staleWhileRevalidateSeconds)}`
    );
  }
  return parts.join(', ');
};

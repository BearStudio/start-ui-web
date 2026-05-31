import { redirect } from '@tanstack/react-router';

declare function parseSafeRedirectPath(input: string): { to: string } | null;
declare const logger: { warn(input: unknown): void };

export function unsafeRedirect(input: { search: { redirect: string } }) {
  throw redirect({ to: input.search.redirect });
}

export function safeRedirect(input: { search: { redirect: string } }) {
  const safe = parseSafeRedirectPath(input.search.redirect);
  if (safe) throw redirect({ to: safe.to });
}

export function unsafeLog(input: { headers: Headers }) {
  logger.warn(input.headers);
}

export function unrelatedResearchRedirect(research: { redirect: string }) {
  throw redirect({ to: research.redirect });
}

export function unrelatedRequestInfoUrl(requestInfo: { url: string }) {
  logger.warn(requestInfo.url);
}

export function unrelatedProfileName(profile: { name: string }) {
  logger.warn(profile.name);
}

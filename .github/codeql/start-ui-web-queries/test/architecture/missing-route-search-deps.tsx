import { createFileRoute } from '@tanstack/react-router';

export const MissingBoth = createFileRoute('/missing')({
  loader: (ctx) => ctx.search.term,
});

export const Complete = createFileRoute('/complete')({
  validateSearch: (search: Record<string, string>) => search,
  loaderDeps: ({ search }) => ({ term: search.term }),
  loader: ({ deps }) => deps.term,
});

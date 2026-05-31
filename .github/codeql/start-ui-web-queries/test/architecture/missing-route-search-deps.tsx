import { createFileRoute } from '@tanstack/react-router';

export const MissingBoth = createFileRoute('/missing')({
  loader: (ctx) => ctx.search.term,
});

export const MissingDestructured = createFileRoute('/missing-destructured')({
  loader: ({ search }) => search.term,
});

export const MissingAliasedDestructured = createFileRoute(
  '/missing-aliased-destructured'
)({
  loader: ({ search: routeSearch }) => routeSearch.term,
});

export const MissingNestedDestructured = createFileRoute(
  '/missing-nested-destructured'
)({
  loader: ({ search: { term } }) => term,
});

const referencedLoader = ({ search }: { search: { term: string } }) =>
  search.term;

export const MissingReferencedLoader = createFileRoute('/missing-referenced')({
  loader: referencedLoader,
});

function declaredLoader(ctx: { search: { term: string } }) {
  return ctx.search.term;
}

export const MissingDeclaredLoader = createFileRoute('/missing-declared')({
  loader: declaredLoader,
});

export const LocalSearchVariable = createFileRoute('/local-search-variable')({
  loader: () => {
    const search = new URLSearchParams('term=local');
    return search.get('term');
  },
});

export const LocalSearchDestructuring = createFileRoute(
  '/local-search-destructuring'
)({
  loader: () => {
    const local = { search: { term: 'local' } };
    const { search } = local;
    return search.term;
  },
});

export const LocalObjectSearchProperty = createFileRoute(
  '/local-object-search-property'
)({
  loader: () => {
    const local = { search: { term: 'local' } };
    return local.search.term;
  },
});

export const Complete = createFileRoute('/complete')({
  validateSearch: (search: Record<string, string>) => search,
  loaderDeps: ({ search }) => ({ term: search.term }),
  loader: ({ deps }) => deps.term,
});

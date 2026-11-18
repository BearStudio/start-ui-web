// The fake backend of the DataTable stories: users, and what an API would answer for a state of the table.

export const userStatuses = ['active', 'invited', 'disabled'] as const;
export const userTags = ['vip', 'beta', 'partner'] as const;

export type User = {
  id: string;
  name: string;
  email: string;
  status: (typeof userStatuses)[number];
  tags: ReadonlyArray<(typeof userTags)[number]>;
  orders: number;
};

const firstNames = ['Jane', 'John', 'Ada', 'Alan', 'Grace', 'Linus', 'Ken'];
const lastNames = ['Cooper', 'Doe', 'Lovelace', 'Turing', 'Hopper', 'Thompson'];

const userAt = (i: number): User => {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]} ${Math.floor(i / 42) + 1}`;
  return {
    id: `u-${i + 1}`,
    name,
    email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`,
    status: userStatuses[i % userStatuses.length] ?? 'active',
    tags: userTags.filter((_, t) => (i + t) % 3 === 0),
    orders: (i * 37) % 120,
  };
};

export const makeUsers = (count: number): ReadonlyArray<User> =>
  Array.from({ length: count }, (_, i) => userAt(i));

export const users = makeUsers(64);

/** What the stories send to the fake API: the state of their table, field by field. */
export type UsersQuery = {
  q?: string;
  orderBy?: 'name' | 'status' | 'orders';
  dir?: 'asc' | 'desc';
  status?: string;
  tags?: ReadonlyArray<string>;
};

/** Stands for your API: the users whose name or email holds the search, that the filters keep, sorted. */
export const queryUsers = (
  query: UsersQuery,
  from: ReadonlyArray<User> = users
): ReadonlyArray<User> => {
  const q = (query.q ?? '').trim().toLowerCase();
  const column = query.orderBy ?? 'name';
  const sign = (query.dir ?? 'asc') === 'asc' ? 1 : -1;
  const tags = query.tags ?? [];
  return from
    .filter(
      (user) =>
        (q === '' ||
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q)) &&
        (query.status === undefined || user.status === query.status) &&
        (tags.length === 0 ||
          tags.some((tag) => user.tags.some((t) => t === tag)))
    )
    .slice()
    .sort((a, b) => {
      const order =
        column === 'orders'
          ? a.orders - b.orders
          : a[column].localeCompare(b[column]);
      return sign * order || a.id.localeCompare(b.id);
    });
};

export type Order = { id: string; customer: string; net: number; vat: number };

export const orders: ReadonlyArray<Order> = users
  .slice(0, 8)
  .map((user, i) => ({
    id: `o-${i + 1}`,
    customer: user.name,
    net: 1000 + i * 250,
    vat: (1000 + i * 250) * 0.2,
  }));

/** How the fake API answers: after `latency` milliseconds, or with an error when `fails`. */
export type FakeNetwork = { latency: number; fails: boolean };

const answer = <A>(network: FakeNetwork, value: () => A) =>
  new Promise<A>((resolve, reject) =>
    setTimeout(
      () =>
        network.fails
          ? reject(new Error('The server did not answer.'))
          : resolve(value()),
      network.latency
    )
  );

/**
 * Stands for a paged API: one page of the users that match, how many match, and the ids of all of them, so a
 * selection can keep only the rows that still match.
 */
export const fetchUsersPage = (
  query: UsersQuery & { page: number; size: number },
  network: FakeNetwork
) =>
  answer(network, () => {
    const matching = queryUsers(query);
    const start = (query.page - 1) * query.size;
    return {
      items: matching.slice(start, start + query.size),
      total: matching.length,
      ids: matching.map((user) => user.id),
    };
  });

/** Stands for an API that lists the tags, for options that load. */
export const fetchTags = (network: FakeNetwork) =>
  answer({ ...network, latency: network.latency * 2 }, () =>
    userTags.map((tag) => ({ value: tag, label: tag }))
  );

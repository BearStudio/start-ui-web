import { Repository } from '@prisma/client';

import { db } from '@/app/api/jhipster-mocks/_helpers/db';

export type RepositoryFormatted<U extends Partial<Repository> = Repository> =
  ReturnType<typeof formatRepositoryFromDb<U>>;

export const formatRepositoryFromDb = <U extends Partial<Repository>>(
  repository?: U | null
) => {
  return !!repository ? repository : undefined;
};

export const getRepositoryList = async (
  options: { skip?: number; take?: number } = {}
) => {
  const [repositories, total] = await Promise.all([
    db.repository.findMany({
      skip: options.skip ?? 0,
      take: options.take ?? 2,
    }),
    db.repository.count(),
  ]);

  return {
    repositories: repositories.map(formatRepositoryFromDb),
    total,
  } as const;
};

export const getRepositoryById = async (id: number) => {
  const repository = await db.repository.findUnique({ where: { id } });
  return formatRepositoryFromDb(repository);
};

export const updateRepositoryById = async (
  id: number,
  partialRepository: Partial<RepositoryFormatted>
) => {
  if (!partialRepository) return undefined;
  const user = await db.repository.update({
    where: { id },
    data: partialRepository,
  });
  return formatRepositoryFromDb(user);
};

export const createRepository = async (
  newRepository: RepositoryFormatted<Pick<Repository, 'link' | 'name'>>
) => {
  if (!newRepository) throw new Error('Missing new repository');

  const repository = await db.repository.create({
    data: newRepository,
  });
  return formatRepositoryFromDb(repository);
};

export const removeRepositoryById = async (id: number) => {
  return db.repository.delete({ where: { id } });
};

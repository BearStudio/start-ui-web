import { Repository } from '@prisma/client';

import { db } from '@/app/api/jhipster-mocks/_helpers/db';

export const getRepositoryList = async (
  options: { skip?: number; take?: number } = {}
) => {
  const [repositories, total] = await Promise.all([
    db.repository.findMany({
      skip: options.skip ?? 0,
      take: options.take ?? 10,
    }),
    db.repository.count(),
  ]);

  return {
    repositories,
    total,
  } as const;
};

export const getRepositoryById = async (id: number) => {
  return await db.repository.findUnique({ where: { id } });
};

export const updateRepositoryById = async (
  id: number,
  partialRepository: Partial<Repository>
) => {
  if (!partialRepository) return undefined;
  return await db.repository.update({
    where: { id },
    data: partialRepository,
  });
};

export const createRepository = async (
  newRepository: Pick<Repository, 'link' | 'name'>
) => {
  if (!newRepository) throw new Error('Missing new repository');

  return await db.repository.create({
    data: newRepository,
  });
};

export const removeRepositoryById = async (id: number) => {
  return db.repository.delete({ where: { id } });
};

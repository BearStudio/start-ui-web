import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { orpc } from '@/lib/orpc/client';

import { Genre } from '@/features/genre/schema';

type GenrePage = {
  items: Genre[];
};

export const mergeGenres = (
  pages: GenrePage[] | undefined,
  linkedGenre?: Genre | null
) => {
  const genresById = new Map<string, Genre>();

  for (const page of pages ?? []) {
    for (const genre of page.items) {
      genresById.set(genre.id, genre);
    }
  }

  if (linkedGenre && !genresById.has(linkedGenre.id)) {
    genresById.set(linkedGenre.id, linkedGenre);
  }

  return [...genresById.values()].sort((genreA, genreB) =>
    genreA.name.localeCompare(genreB.name)
  );
};

export const useBookGenres = (linkedGenre?: Genre | null) => {
  const { data } = useQuery(orpc.genre.getAllNoCursor.queryOptions());

  return useMemo(
    () => mergeGenres(data ? [{ items: data }] : undefined, linkedGenre),
    [data, linkedGenre]
  );
};

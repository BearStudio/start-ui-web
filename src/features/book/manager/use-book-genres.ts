import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

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

  if (linkedGenre) {
    genresById.set(linkedGenre.id, linkedGenre);
  }

  return [...genresById.values()].sort((genreA, genreB) =>
    genreA.name.localeCompare(genreB.name)
  );
};

export const useBookGenres = (linkedGenre?: Genre | null) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      orpc.genre.getAll.infiniteOptions({
        input: (cursor: string | undefined) => ({
          cursor,
        }),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      })
    );

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return useMemo(
    () => mergeGenres(data?.pages, linkedGenre),
    [data?.pages, linkedGenre]
  );
};

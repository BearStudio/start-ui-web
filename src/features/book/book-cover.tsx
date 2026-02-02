import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { envClient } from '@/env/client';
import { Book } from '@/features/book/schema';

export const BookCover = (props: {
  book: Partial<Pick<Book, 'title' | 'author' | 'genre' | 'coverId'>>;
  variant?: 'default' | 'tiny';
  className?: string;
}) => {
  const { t } = useTranslation(['book']);

  return (
    <div
      className={cn(
        '@container relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-sm bg-neutral-800 p-[10%] pl-[16%] text-white shadow-2xl',
        props.variant === 'tiny' && 'w-8 rounded-xs',
        props.className
      )}
      style={
        props.book.coverId
          ? undefined
          : {
              backgroundColor: props.book.genre?.color ?? '#333',
            }
      }
    >
      <div className="absolute inset-y-0 left-0 z-10 w-[5%] bg-gradient-to-r from-black/0 to-black/10 bg-blend-screen" />
      <div className="absolute inset-y-0 left-[5%] z-10 w-[2%] bg-gradient-to-r from-white/0 to-white/20 bg-blend-screen" />
      <div className="absolute inset-y-0 left-[7%] z-10 w-[2%] bg-gradient-to-r from-white/0 to-white/20 bg-blend-screen" />
      <div className="absolute -top-1/8 -right-1/8 z-10 aspect-square w-3/4 rounded-full bg-white/40 bg-blend-screen blur-xl @6xs:blur-2xl @5xs:blur-3xl" />
      <div className="absolute -bottom-1/8 -left-1/8 z-10 aspect-square w-3/4 rounded-full bg-black/40 bg-blend-screen blur-xl @6xs:blur-2xl @5xs:blur-3xl" />
      {!!props.book.coverId && (
        <>
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            src={`${envClient.VITE_S3_BUCKET_PUBLIC_URL}/${props.book.coverId}`}
          />
        </>
      )}
      <div
        className={cn(
          'relative flex flex-1 flex-col justify-between',
          !!props.book.coverId && 'sr-only'
        )}
      >
        <h3
          className={cn(
            'text-sm leading-tight font-bold break-words @6xs:text-base @5xs:text-lg @4xs:text-xl',
            props.variant === 'tiny' && 'text-[2px]'
          )}
        >
          {props.book.title ?? ''}
        </h3>
        <div className="flex flex-col">
          {!!props.book.author && (
            <p
              className={cn(
                'text-xs break-words opacity-60',
                props.variant === 'tiny' && 'text-[1px]'
              )}
            >
              {t('book:common.byCapitalized')} {props.book.author}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

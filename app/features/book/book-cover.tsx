import { cn } from '@/lib/tailwind/utils';

import { Book } from '@/features/book/schema';

export const BookCover = (props: {
  book: Pick<Book, 'id' | 'title' | 'author' | 'genre'>;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-sm bg-neutral-800 p-4 pl-6 text-white shadow-2xl [view-transition-name:book-cover]',
        props.className
      )}
      style={{
        background: '#333', // TODO get color from genre
      }}
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/0 to-black/10 bg-blend-screen" />
      <div className="absolute inset-y-0 left-1.5 w-0.5 bg-gradient-to-r from-white/0 to-white/20 bg-blend-screen" />
      <div className="absolute inset-y-0 left-2 w-0.5 bg-gradient-to-r from-white/0 to-white/20 bg-blend-screen" />
      <div className="absolute -top-1/8 -right-1/8 aspect-square w-3/4 rounded-full bg-white/40 bg-blend-screen blur-3xl" />
      <div className="absolute -bottom-1/8 -left-1/8 aspect-square w-3/4 rounded-full bg-black/40 bg-blend-screen blur-3xl" />
      <div className="relative flex flex-1 flex-col justify-between">
        <h3 className="text-base leading-tight font-bold xs:text-lg">
          {props.book.title}
        </h3>
        <div className="flex flex-col">
          <p className="text-xs opacity-60">By {props.book.author}</p>
          {!!props.book.genre && (
            <p className="text-2xs capitalize opacity-60">{props.book.genre}</p>
          )}
        </div>
      </div>
    </div>
  );
};

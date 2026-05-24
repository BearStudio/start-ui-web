import { Skeleton } from '@/platform/components/ui/skeleton';
function Default() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 flex-none rounded-full" />
      <div className="flex min-w-0 flex-col gap-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export default {
  Default,
};

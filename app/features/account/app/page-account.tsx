import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAccount = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="overflow-hidden text-base font-bold text-ellipsis">
          Account
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>Page content</PageLayoutContent>
    </PageLayout>
  );
};

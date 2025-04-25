import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageNewUser = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar
        backButton={<BackButton />}
        actions={
          <>
            <Button size="sm">Create</Button>
          </>
        }
      >
        <PageLayoutTopBarTitle>New User</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>TODO</PageLayoutContent>
    </PageLayout>
  );
};

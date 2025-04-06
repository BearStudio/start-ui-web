import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/manager/page-layout';

export const PageRepository = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar
        backButton={
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="..">
              <ArrowLeftIcon />
            </Link>
          </Button>
        }
        actions={<Button size="sm">Save</Button>}
      >
        <h1 className="text-base font-medium md:text-sm">Repo name</h1>
      </PageLayoutTopBar>
      <PageLayoutContent>...</PageLayoutContent>
    </PageLayout>
  );
};

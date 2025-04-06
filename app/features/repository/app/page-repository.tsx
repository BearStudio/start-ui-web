import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageRepository = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar
        leftActions={
          <div className="flex items-center gap-3">
            <div className="-mx-1">
              <Button asChild variant="ghost" size="icon-sm">
                <Link to="..">
                  <ArrowLeftIcon />
                </Link>
              </Button>
            </div>
            <Separator orientation="vertical" className="h-4" />
          </div>
        }
        rightActions={<Button size="sm">Save</Button>}
      >
        <h1 className="text-base font-medium md:text-sm">Repo name</h1>
      </PageLayoutTopBar>
      <PageLayoutContent>...</PageLayoutContent>
    </PageLayout>
  );
};

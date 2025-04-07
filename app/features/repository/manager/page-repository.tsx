import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

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
        actions={
          <>
            <ResponsiveIconButton variant="ghost" label="Delete">
              <Trash2Icon />
            </ResponsiveIconButton>
            <Button size="sm" variant="secondary">
              <PencilLineIcon />
              Edit
            </Button>
          </>
        }
      >
        <h1 className="text-base font-medium md:text-sm">Repo name</h1>
      </PageLayoutTopBar>
      <PageLayoutContent>...</PageLayoutContent>
    </PageLayout>
  );
};

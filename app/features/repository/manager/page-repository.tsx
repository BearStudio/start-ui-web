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
        leftActions={
          <Button size="icon-sm" variant="secondary" asChild>
            <Link to="..">
              {/** TODO translation */}
              <span className="sr-only">Back</span>
              <ArrowLeftIcon />
            </Link>
          </Button>
        }
        rightActions={
          <>
            <Button size="sm" variant="secondary" asChild>
              <Link to="..">Cancel</Link>
            </Button>
            <Button size="sm">Save</Button>
          </>
        }
      >
        <h1 className="overflow-hidden text-base font-bold text-ellipsis whitespace-nowrap">
          Repo name
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        START
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut velit
        aliquid officia suscipit iste, labore cum distinctio. Harum voluptate
        modi, reiciendis quasi, ab velit asperiores, quod quia et consectetur
        minus?
        <br />
        END
      </PageLayoutContent>
    </PageLayout>
  );
};

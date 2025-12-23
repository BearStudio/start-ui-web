import { Link, useMatchRoute } from '@tanstack/react-router';
import { BoxIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageGoodiesStock = () => {
  const matchRoute = useMatchRoute();

  const isStock = matchRoute({ to: '/manager/goodies/stock' });
  const isSuppliers = matchRoute({ to: '/manager/goodies/suppliers' });
  return (
    <PageLayout>
      <PageLayoutTopBar
        actions={
          <ResponsiveIconButton
            asChild
            label="Nouveau goodie"
            variant="secondary"
            size="sm"
          >
            <div className="flex gap-2">
              <PlusIcon />
            </div>
          </ResponsiveIconButton>
        }
      >
        <PageLayoutTopBarTitle>
          <div className="flex flex-row items-center gap-4">
            <BoxIcon />

            <div className="flex flex-row gap-2 rounded-xl bg-primary-foreground p-1">
              <Link to="/manager/goodies/stock">
                <Button variant={isStock ? 'default' : 'secondary'}>
                  Gestion du Stock
                </Button>
              </Link>

              <Link to="/manager/goodies/suppliers">
                <Button variant={isSuppliers ? 'default' : 'secondary'}>
                  Gestion des Fournisseurs
                </Button>
              </Link>
            </div>
          </div>
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent className="pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="bg-gray-200 flex h-100 items-center justify-center rounded-lg border-3"
            >
              <span>Item {item}</span>
            </div>
          ))}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};

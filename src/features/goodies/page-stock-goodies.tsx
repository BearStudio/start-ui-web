import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { useCursors } from 'kikoojs';
import { BoxIcon, PlusIcon } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import CardGoodieDisplay from '@/features/goodies/components/card-goodie-display';
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

  const goodiesQuery = useInfiniteQuery(
    orpc.goodie.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const goodies = goodiesQuery.data?.pages[0]?.items;

  // Retourne le stock total d'un goodie
  const getTotalStock = (variants: { stockQty?: number }[]) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((total, v) => total + (v.stockQty ?? 0), 0);
  };
  useCursors({
    enabledCursors: 'rainbowCursor',
  });

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
            <Link to="/manager/goodies/new">
              <div className="flex gap-2">
                <PlusIcon />
              </div>
            </Link>
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
          {goodies?.map((goodie) => (
            <CardGoodieDisplay
              key={goodie.id}
              id={goodie.id}
              title={goodie.name}
              year={goodie.edition ?? ''}
              category={goodie.category}
              description={goodie.description ?? ''}
              stock={
                goodie.total ? goodie.total : getTotalStock(goodie.variants)
              }
              variants={goodie.variants}
              imageUrl={goodie.assets[0]?.url}
            />
          ))}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};

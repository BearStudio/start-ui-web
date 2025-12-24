import { Link, useMatchRoute } from '@tanstack/react-router';
import {
  BoxIcon,
  Building2,
  ImageIcon,
  Lightbulb,
  Package,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import GoodieAssetsTab from '@/features/goodies/tab-images-bank';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

import { FormIdeaNew } from './manager/form-idea-new';
import GoodieOrdersTab from './tab-orders-tracking';
import GoodieSuppliersTab from './tab-suppliers-list';

export const PageGoodiesSuppliers = () => {
  const matchRoute = useMatchRoute();

  const isStock = matchRoute({ to: '/manager/goodies/stock' });
  const isSuppliers = matchRoute({ to: '/manager/goodies/suppliers' });
  return (
    <PageLayout>
      <PageLayoutTopBar>
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
        <Tabs defaultValue="newIdea" className="flex flex-col gap-10">
          <div className="flex gap-2 rounded-lg bg-white p-2">
            <TabsList className="flex w-full gap-4 bg-transparent">
              <TabsTrigger
                asChild
                value="newIdea"
                className="flex flex-1 bg-transparent"
              >
                <Button
                  variant="ghost"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Lightbulb />
                  Idées à venir
                </Button>
              </TabsTrigger>

              <TabsTrigger
                asChild
                value="suppliersList"
                className="flex flex-1"
              >
                <Button
                  variant="ghost"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Building2 />
                  Fournisseurs
                </Button>
              </TabsTrigger>

              <TabsTrigger
                asChild
                value="createdObject"
                className="flex flex-1"
              >
                <Button
                  variant="ghost"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Package />
                  Objets créés
                </Button>
              </TabsTrigger>
              <TabsTrigger asChild value="imagesBank" className="flex flex-1">
                <Button
                  variant="ghost"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <ImageIcon />
                  Banque d'images
                </Button>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="newIdea">
            <FormIdeaNew />
          </TabsContent>
          <TabsContent value="suppliersList">
            <GoodieSuppliersTab />
          </TabsContent>
          <TabsContent value="createdObject">
            <GoodieOrdersTab />
          </TabsContent>
          <TabsContent value="imagesBank">
            <GoodieAssetsTab />
          </TabsContent>
        </Tabs>
      </PageLayoutContent>
    </PageLayout>
  );
};

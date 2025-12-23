import { Link, useMatchRoute } from '@tanstack/react-router';
import {
  BoxIcon,
  Building2,
  ImageIcon,
  Lightbulb,
  StarIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

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
        <Tabs defaultValue="newIdea" className="flex gap-10">
          <TabsList className="flex w-full flex-1 gap-4 bg-white p-2">
            <TabsTrigger asChild value="newIdea" className="flex flex-1">
              <Button
                variant="ghost"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Lightbulb />
                Idées à venir
              </Button>
            </TabsTrigger>

            <TabsTrigger asChild value="suppliersList" className="flex flex-1">
              <Button
                variant="ghost"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 />
                Fournisseurs
              </Button>
            </TabsTrigger>

            <TabsTrigger asChild value="createdObject" className="flex flex-1">
              <Button
                variant="ghost"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <StarIcon />
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
          <TabsContent value="newIdea">
            <span>Ajouter le fichier du composant contenant ce tabs</span>
          </TabsContent>
          <TabsContent value="suppliersList">
            <span>Ajouter le fichier du composant contenant ce tabs</span>
          </TabsContent>
          <TabsContent value="createdObject">
            <span>Ajouter le fichier du composant contenant ce tabs</span>
          </TabsContent>
          <TabsContent value="imagesBank">
            <span>Ajouter le fichier du composant contenant ce tabs</span>
          </TabsContent>
        </Tabs>
      </PageLayoutContent>
    </PageLayout>
  );
};

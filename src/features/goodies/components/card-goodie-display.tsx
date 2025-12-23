import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Edit, EllipsisVertical, Shirt, Trash } from 'lucide-react';

import { orpc } from '@/lib/orpc/client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SizeStock {
  size: string;
  stockQty: number;
}

interface CardGoodieDisplayProps {
  id: string; // pour les actions
  title: string;
  year: string;
  category: string;
  description?: string;
  stock?: number;
  sizesStocks?: SizeStock[];
  imageUrl?: string;
}

export default function CardGoodieDisplay({
  id,
  title,
  year,
  category,
  description,
  stock,
  sizesStocks,
  imageUrl,
}: CardGoodieDisplayProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mutation pour supprimer le goodie
  const deleteGoodie = useMutation(
    orpc.goodie.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.goodie.getAll.key() });
      },
      onError: (error: unknown) => {
        console.error('Erreur lors de la suppression:', error);
      },
    })
  );

  return (
    <Card className="flex h-full flex-col shadow-lg transition-shadow duration-200 hover:shadow-xl">
      {/* IMAGE + STOCK + ACTIONS */}
      <div className="bg-gray-100 relative flex h-48 w-full items-center justify-center overflow-hidden rounded-t-xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-contain"
          />
        ) : (
          <Shirt className="text-gray-400 h-16 w-16" />
        )}
        <Badge className="text-gray-800 absolute top-2 left-2 bg-white shadow-sm">
          Stock: {stock}
        </Badge>

        {/* Menu Meatballs */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.navigate({ to: `/manager/goodies/${id}/edit` })
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteGoodie.mutate({ id: id })}>
              <Trash className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* HEADER */}
      <CardHeader className="flex flex-col items-center justify-center px-4 pt-4 text-center">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="text-gray-500 text-sm">
          {year}
        </CardDescription>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="flex flex-col gap-2 px-4 pb-4">
        <Badge variant="secondary">{category}</Badge>
        {description && (
          <p className="text-gray-700 text-center text-sm">{description}</p>
        )}
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex flex-col gap-2 px-4 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {sizesStocks?.map((sizeStock) => (
            <Badge key={sizeStock.size} variant="secondary">
              {sizeStock.size}: {sizeStock.stockQty}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

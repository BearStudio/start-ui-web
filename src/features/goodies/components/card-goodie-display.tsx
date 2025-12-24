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

interface VariantStock {
  size?: string | null;
  color?: string | null;
  stockQty: number;
}

interface CardGoodieDisplayProps {
  id: string;
  title: string;
  year: string;
  category: string;
  description?: string;
  stock?: number;
  variants?: VariantStock[];
  imageUrl?: string;
}

export default function CardGoodieDisplay({
  id,
  title,
  year,
  category,
  description,
  stock,
  variants,
  imageUrl,
}: CardGoodieDisplayProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasSize = variants?.some((v) => v.size);
  const hasColor = variants?.some((v) => v.color);

  const variantsBySize = variants?.reduce<
    Record<string, { color: string; qty: number }[]>
  >((acc, v) => {
    if (!v.size || !v.color) return acc;

    acc[v.size] ??= [];
    if (!acc[v.size]) {
      acc[v.size] = [];
    }
    acc[v.size]?.push({ color: v.color, qty: v.stockQty });

    return acc;
  }, {});

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
      <CardFooter className="flex flex-col items-center gap-2 px-4 pb-4 text-center">
        {/* Taille + Couleur */}
        {hasSize && hasColor && variantsBySize && (
          <div className="flex w-full flex-col items-center justify-center gap-6">
            {Object.entries(variantsBySize).map(([size, colors]) => (
              <div
                key={size}
                className="flex flex-col items-center justify-center gap-3"
              >
                <Badge variant="outline" className="w-fit">
                  Taille {size}
                </Badge>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {colors.map((c, i) => (
                    <Badge key={i} variant="secondary">
                      {c.color}: {c.qty}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Taille uniquement */}
        {hasSize && !hasColor && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {variants?.map((v, i) => (
              <Badge key={i} variant="secondary">
                {v.size}: {v.stockQty}
              </Badge>
            ))}
          </div>
        )}

        {/* Couleur uniquement */}
        {!hasSize && hasColor && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {variants?.map((v, i) => (
              <Badge key={i} variant="secondary">
                {v.color}: {v.stockQty}
              </Badge>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

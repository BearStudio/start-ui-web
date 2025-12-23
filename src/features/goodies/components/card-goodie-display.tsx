import { EllipsisVertical, Shirt } from 'lucide-react';

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

interface SizeStock {
  size: string;
  stockQty: number;
}

interface GoodieDisplayCardProps {
  title: string;
  year: string;
  category: string;
  description?: string;
  stock?: number;
  sizesStocks?: SizeStock[];
  imageUrl?: string;
}

export default function CardGoodieDisplay({
  title,
  year,
  category,
  description,
  stock,
  sizesStocks,
  imageUrl,
}: GoodieDisplayCardProps) {
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
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2"
        >
          <EllipsisVertical />
        </Button>
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

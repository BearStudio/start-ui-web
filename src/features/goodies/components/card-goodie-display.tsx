import { EllipsisVertical, Minus, Plus, Shirt } from 'lucide-react';

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
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export default function CardGoodieDisplay({
  title,
  year,
  category,
  description,
  stock,
  sizesStocks,
  imageUrl,
  onIncrement,
  onDecrement,
}: GoodieDisplayCardProps) {
  return (
    <Card>
      <div>
        {imageUrl ? <img src={imageUrl} title={title} /> : <Shirt />}
        <Badge variant="outline">Stock: {stock}</Badge>
        <Button>
          <EllipsisVertical />
        </Button>
      </div>

      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{year}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{category}</Badge>
        {description}
      </CardContent>
      <CardFooter>
        Tailles disponibles:
        {(sizesStocks ?? []).map((sizeStock) => (
          <Badge key={sizeStock.size} variant="secondary">
            {sizeStock.size}: {sizeStock.stockQty}
          </Badge>
        ))}
        {(sizesStocks ?? []).length == 0 && (
          <>
            <Button size="icon-lg" variant="destructive" onClick={onIncrement}>
              <Plus />
            </Button>
            <Button size="icon-lg" variant="destructive" onClick={onDecrement}>
              <Minus />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderCardProps {
  status: string;
  goodieId: string;
  supplierId: string;
  requestedById: string;
  madeById: string;
  requestedAt: string;
  orderedAt: string;
  receivedAt: string;
  quantity: string;
  qualityNote: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  onDelete?: () => void;
}

export default function CardOrder({
  status,
  goodieId,
  supplierId,
  requestedById,
  madeById,
  requestedAt,
  orderedAt,
  receivedAt,
  quantity,
  qualityNote,
  comment,
  createdAt,
  updatedAt,
  onDelete,
}: OrderCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-2 right-2 p-1"
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </Button>

      <CardHeader>
        <CardTitle>{goodieId}</CardTitle>
      </CardHeader>
      <CardContent>
        {supplierId}
        {requestedById}
        {madeById}
        {requestedAt}
        {orderedAt}
        {receivedAt}
        {quantity}
        {qualityNote}
        {comment}
        {createdAt}
        {updatedAt}
        {status}
      </CardContent>
    </Card>
  );
}

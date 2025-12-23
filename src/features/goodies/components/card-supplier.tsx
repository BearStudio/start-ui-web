import { Globe, Mail, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SupplierCardProps {
  name: string;
  websiteUrl: string;
  contact: string;
  comment: string;
  onDelete?: () => void;
}

export default function CardSupplier({
  name,
  websiteUrl,
  contact,
  comment,
  onDelete,
}: SupplierCardProps) {
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
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        {contact && (
          <div className="flex items-center gap-2">
            <Mail className="text-gray-500 h-4 w-4" />
            <span>{contact}</span>
          </div>
        )}

        {websiteUrl && (
          <div className="flex items-center gap-2">
            <Globe className="text-gray-500 h-4 w-4" />
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {websiteUrl}
            </a>
          </div>
        )}

        {comment && <div>{comment}</div>}
      </CardContent>
    </Card>
  );
}

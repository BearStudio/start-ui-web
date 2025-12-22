import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export const zGoodieCategory = z.enum([
  'TSHIRT',
  'HOODIE',
  'STICKER',
  'MUG',
  'TOTE_BAG',
  'NOTEBOOK',
  'OTHER',
]);

export const zGoodieOrderStatus = z.enum([
  'IDEA',
  'REQUESTED',
  'QUOTED',
  'ORDERED',
  'RECEIVED',
  'CANCELLED',
]);

export const zAssetType = z.enum(['LOGO', 'MOCKUP', 'PHOTO', 'OTHER']);

export type Goodie = z.infer<ReturnType<typeof zGoodie>>;

export const zGoodieVariant = z.object({
  key: z.string(),
  size: z.string().optional(),
  color: z.string().optional(),
  stockQty: z.number().int().nonnegative().optional(),
});

//============ Goodie ============
export const zGoodie = () =>
  z.object({
    id: z.string(),
    name: zu.fieldText.required(),
    edition: zu.fieldText.nullish(),
    category: zGoodieCategory,
    description: zu.fieldText.nullish(),
    photoUrl: z.string().url().nullish(),

    variants: z.array(zGoodieVariant),

    releaseLabel: zu.fieldText.nullish(),
    releaseDate: z.date().nullish(),

    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type FormFieldsGoodie = z.infer<ReturnType<typeof zFormFieldsGoodie>>;
export const zFormFieldsGoodie = () =>
  zGoodie().pick({
    name: true,
    edition: true,
    category: true,
    description: true,
    photoUrl: true,
    variants: true,
    releaseLabel: true,
    releaseDate: true,
  });

//============ Supplier ============
export type Supplier = z.infer<ReturnType<typeof zSupplier>>;

export const zSupplier = () =>
  z.object({
    id: z.string(),
    name: zu.fieldText.required(),
    websiteUrl: z.string().url().nullish(),
    contact: zu.fieldText.nullish(),
    comment: zu.fieldText.nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type FormFieldsSupplier = z.infer<
  ReturnType<typeof zFormFieldsSupplier>
>;
export const zFormFieldsSupplier = () =>
  zSupplier().pick({
    name: true,
    websiteUrl: true,
    contact: true,
    comment: true,
  });

//============ Order ============
export type GoodieOrder = z.infer<ReturnType<typeof zGoodieOrder>>;

export const zGoodieOrder = () =>
  z.object({
    id: z.string(),
    status: zGoodieOrderStatus,

    goodieId: z.string().nullish(),
    supplierId: z.string().nullish(),
    requestedById: z.string().nullish(),
    madeById: z.string().nullish(),

    requestedAt: z.date().nullish(),
    orderedAt: z.date().nullish(),
    receivedAt: z.date().nullish(),

    quantity: z.number().int().positive().nullish(),
    qualityNote: zu.fieldText.nullish(),
    comment: zu.fieldText.nullish(),

    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type FormFieldsGoodieOrder = z.infer<
  ReturnType<typeof zFormFieldsGoodieOrder>
>;
export const zFormFieldsGoodieOrder = () =>
  zGoodieOrder().pick({
    status: true,
    goodieId: true,
    supplierId: true,
    quantity: true,
    qualityNote: true,
    comment: true,
  });

//============ Asset ============
export type Asset = z.infer<ReturnType<typeof zAsset>>;

export const zAsset = () =>
  z.object({
    id: z.string(),
    type: zAssetType,
    name: zu.fieldText.required(),
    url: z.string().url(),
    comment: zu.fieldText.nullish(),

    goodieId: z.string().nullish(),
    supplierId: z.string().nullish(),

    createdAt: z.date(),
  });

export type FormFieldsAsset = z.infer<ReturnType<typeof zFormFieldsAsset>>;
export const zFormFieldsAsset = () =>
  zAsset().pick({
    type: true,
    name: true,
    url: true,
    comment: true,
    goodieId: true,
    supplierId: true,
  });

//============ Grant ============
export type GoodieGrant = z.infer<ReturnType<typeof zGoodieGrant>>;

export const zGoodieGrant = () =>
  z.object({
    id: z.string(),
    userId: z.string(),
    goodieId: z.string(),
    variantKey: z.string().nullish(),
    quantity: z.number().int().positive(),
    grantedAt: z.date(),
    reason: zu.fieldText.nullish(),
    comment: zu.fieldText.nullish(),
  });

export type FormFieldsGoodieGrant = z.infer<
  ReturnType<typeof zFormFieldsGoodieGrant>
>;
export const zFormFieldsGoodieGrant = () =>
  zGoodieGrant().pick({
    userId: true,
    goodieId: true,
    variantKey: true,
    quantity: true,
    reason: true,
    comment: true,
  });

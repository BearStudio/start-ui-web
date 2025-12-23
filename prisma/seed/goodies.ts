import { faker } from '@faker-js/faker';
import { randomInt } from 'node:crypto';

import { db } from '@/server/db';
import {
  AssetType,
  GoodieCategory,
  GoodieOrderStatus,
} from '@/server/db/generated/client';

export async function createGoodies() {
  console.log('⏳ Seeding goodies ecosystem');

  const users = await db.user.findMany();
  const suppliers = await seedSuppliers();
  const goodies = await seedGoodies();
  await seedAssets(goodies, suppliers);
  await seedGoodieOrders(goodies, suppliers, users);
  const packs = await seedOnboardingPacks(goodies);
  await seedOnboardingAssignments(packs, users);
  await seedGoodieGrants(goodies, users);

  console.log('✅ Goodies ecosystem seeded');
}
async function seedSuppliers() {
  const existing = await db.supplier.count();
  if (existing > 0) return db.supplier.findMany();

  const suppliers = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      db.supplier.create({
        data: {
          name: faker.company.name(),
          websiteUrl: faker.internet.url(),
          contact: faker.internet.email(),
          comment: faker.lorem.sentence(),
        },
      })
    )
  );

  console.log(`✅ ${suppliers.length} suppliers created`);
  return suppliers;
}
async function seedGoodies() {
  const existing = await db.goodie.count();
  if (existing > 0) return db.goodie.findMany();

  const goodies = await Promise.all(
    Array.from({ length: 8 }).map(() =>
      db.goodie.create({
        data: {
          name: faker.commerce.productName(),
          edition: faker.date.past().getFullYear().toString(),
          category: faker.helpers.enumValue(GoodieCategory),
          description: faker.commerce.productDescription(),
          photoUrl: faker.image.urlLoremFlickr({ category: 'product' }),
          variants: [
            { key: 'S', size: 'S', stockQty: randomInt(10, 50) },
            { key: 'M', size: 'M', stockQty: randomInt(10, 50) },
            { key: 'L', size: 'L', stockQty: randomInt(10, 50) },
          ],
        },
      })
    )
  );

  console.log(`✅ ${goodies.length} goodies created`);
  return goodies;
}
async function seedAssets(goodies: ExplicitAny[], suppliers: ExplicitAny[]) {
  await Promise.all(
    goodies.map((goodie) =>
      db.asset.create({
        data: {
          name: `${goodie.name} logo`,
          type: faker.helpers.enumValue(AssetType),
          url: faker.image.url(),
          goodieId: goodie.id,
          supplierId: suppliers[randomInt(suppliers.length)]?.id ?? null,
        },
      })
    )
  );

  console.log('✅ Assets created');
}
async function seedGoodieOrders(
  goodies: ExplicitAny[],
  suppliers: ExplicitAny[],
  users: ExplicitAny[]
) {
  await Promise.all(
    Array.from({ length: 12 }).map(() => {
      const requester = users[randomInt(users.length)];
      const maker = users[randomInt(users.length)];

      return db.goodieOrder.create({
        data: {
          status: GoodieOrderStatus.ORDERED,

          goodie: {
            connect: { id: goodies[randomInt(goodies.length)].id },
          },

          supplier: {
            connect: { id: suppliers[randomInt(suppliers.length)].id },
          },

          requestedBy: {
            connect: { id: requester.id },
          },

          madeBy: {
            connect: { id: maker.id },
          },

          quantity: randomInt(10, 200),
          comment: faker.lorem.sentence(),
          requestedAt: faker.date.past(),
          orderedAt: faker.date.recent(),
        },
      });
    })
  );

  console.log('✅ Goodie orders created');
}

async function seedOnboardingPacks(goodies: ExplicitAny[]) {
  const pack = await db.onboardingPack.create({
    data: {
      name: 'Welcome Pack',
      comment: 'Standard onboarding goodies',
      items: {
        create: goodies.slice(0, 3).map((goodie) => ({
          goodieId: goodie.id,
          variantKey: 'M',
          quantity: 1,
        })),
      },
    },
    include: { items: true },
  });

  console.log('✅ Onboarding pack created');
  return [pack];
}
async function seedOnboardingAssignments(
  packs: ExplicitAny[],
  users: ExplicitAny[]
) {
  await Promise.all(
    users.slice(0, 10).map((user) =>
      db.onboardingAssignment.create({
        data: {
          userId: user.id,
          packId: packs[0].id,
          isDone: faker.datatype.boolean(),
        },
      })
    )
  );

  console.log('✅ Onboarding assignments created');
}

async function seedGoodieGrants(goodies: ExplicitAny[], users: ExplicitAny[]) {
  await Promise.all(
    users.slice(0, 20).map((user) =>
      db.goodieGrant.create({
        data: {
          userId: user.id,
          goodieId: goodies[randomInt(goodies.length)].id,
          variantKey: 'M',
          quantity: 1,
          reason: 'Onboarding',
        },
      })
    )
  );

  console.log('✅ Goodie grants created');
}

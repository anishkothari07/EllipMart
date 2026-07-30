import 'dotenv/config';
import { ProductStatus, ProductVisibility } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { prisma } from '../lib/prisma/client';
import { ensureDefaultPaymentMethods } from '../lib/modules/payment/payment-seed';

async function main() {
  faker.seed(2026);

  console.log('Starting deterministic seed (faker.seed(2026))...');

  // 1. Brands (20)
  const brands = [];
  for (let i = 0; i < 20; i++) {
    brands.push({
      id: faker.string.uuid(),
      name: faker.company.name(),
      slug: faker.helpers.slugify(faker.company.name() + '-' + i).toLowerCase(),
      description: faker.company.catchPhrase(),
      isActive: true,
    });
  }
  await prisma.brand.createMany({ data: brands });
  console.log('Created 20 Brands');

  // 2. Categories (100)
  const categories = [];
  // 10 Parent Categories
  for (let i = 0; i < 10; i++) {
    categories.push({
      id: faker.string.uuid(),
      name: faker.commerce.department() + ` ${i}`,
      slug: faker.helpers.slugify(faker.commerce.department() + `-${i}`).toLowerCase(),
      parentId: null,
    });
  }
  // 90 Child Categories
  for (let i = 0; i < 90; i++) {
    categories.push({
      id: faker.string.uuid(),
      name: faker.commerce.productAdjective() + ' ' + faker.commerce.department() + ` ${i}`,
      slug: faker.helpers.slugify(`cat-child-${i}`).toLowerCase(),
      parentId: categories[faker.number.int({ min: 0, max: 9 })].id,
    });
  }
  await prisma.category.createMany({ data: categories });
  console.log('Created 100 Categories');

  // 3. Tags (40)
  const tags = [];
  for (let i = 0; i < 40; i++) {
    const name = faker.commerce.productAdjective() + ' ' + i;
    tags.push({
      id: faker.string.uuid(),
      name,
      slug: faker.helpers.slugify(name).toLowerCase(),
    });
  }
  await prisma.tag.createMany({ data: tags });
  console.log('Created 40 Tags');

  // 4. Collections (50)
  const collections = [];
  for (let i = 0; i < 50; i++) {
    collections.push({
      id: faker.string.uuid(),
      name: `Collection ${i}`,
      slug: `collection-${i}`,
      description: faker.lorem.sentence(),
      isAutomatic: faker.datatype.boolean(),
    });
  }
  await prisma.collection.createMany({ data: collections });
  console.log('Created 50 Collections');

  // 5. Attributes (25) & AttributeValues (120)
  const attributeIds: string[] = [];
  for (let i = 0; i < 25; i++) {
    const attrId = faker.string.uuid();
    attributeIds.push(attrId);
    await prisma.attribute.create({
      data: {
        id: attrId,
        name: `Attribute ${i}`,
        type: 'text',
        values: {
          create: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }).map((_, j) => ({
            value: `Value ${i}-${j}`,
          })),
        },
      },
    });
  }
  console.log('Created 25 Attributes with Values');

  // 6. SpecificationGroups (10) & Specifications (1500 total, roughly 150 per group)
  for (let i = 0; i < 10; i++) {
    await prisma.specificationGroup.create({
      data: {
        id: faker.string.uuid(),
        name: `Spec Group ${i}`,
        specs: {
          create: Array.from({ length: 150 }).map((_, j) => ({
            id: faker.string.uuid(),
            name: `Spec ${i}-${j}`,
          })),
        },
      },
    });
  }
  console.log('Created 10 Specification Groups and 1500 Specifications');

  // Load created entities for relational mapping
  const allAttributes = await prisma.attribute.findMany({ include: { values: true } });
  const allSpecs = await prisma.specification.findMany();

  // 7. Products (300), Variants (800), Inventory (300?), Movements (2000)
  // Wait, user asked for "300 Inventory records" -> This implies only some variants have inventory, 
  // or maybe 800 inventory records (1 per variant) makes more sense. Let's create an inventory for each variant, so 800 inventories, but 2000 movements.
  console.log('Creating 300 Products with Variants, Pricing, and Inventory...');

  for (let i = 0; i < 300; i++) {
    const productId = faker.string.uuid();
    const productTags = faker.helpers.arrayElements(tags, faker.number.int({ min: 1, max: 4 }));
    const productCollections = faker.helpers.arrayElements(collections, faker.number.int({ min: 0, max: 2 }));
    const productSpecs = faker.helpers.arrayElements(allSpecs, faker.number.int({ min: 2, max: 6 }));

    const numVariants = faker.number.int({ min: 1, max: 4 });

    await prisma.product.create({
      data: {
        id: productId,
        name: faker.commerce.productName() + ` ${i}`,
        slug: faker.helpers.slugify(`product-${i}-${faker.string.alphanumeric(4)}`).toLowerCase(),
        shortDescription: faker.commerce.productDescription(),
        longDescription: faker.lorem.paragraphs(2),
        status: faker.helpers.arrayElement([ProductStatus.ACTIVE, ProductStatus.DRAFT]),
        visibility: faker.helpers.arrayElement([ProductVisibility.PUBLIC, ProductVisibility.HIDDEN]),
        brandId: faker.helpers.arrayElement(brands).id,
        categoryId: faker.helpers.arrayElement(categories).id,
        tags: {
          create: productTags.map(t => ({ tagId: t.id }))
        },
        collections: {
          create: productCollections.map(c => ({ collectionId: c.id }))
        },
        specifications: {
          create: productSpecs.map(s => ({
            specId: s.id,
            value: faker.word.adjective(),
          }))
        },
        variants: {
          create: Array.from({ length: numVariants }).map((_, vIdx) => {
            const variantId = faker.string.uuid();
            const mrp = faker.number.float({ min: 50, max: 1000, fractionDigits: 2 });
            const sellingPrice = faker.number.float({ min: 20, max: mrp, fractionDigits: 2 });
            
            return {
              id: variantId,
              sku: `SKU-${i}-${vIdx}-${faker.string.alphanumeric(4)}`.toUpperCase(),
              barcode: faker.string.numeric(12),
              name: `Variant ${vIdx}`,
              pricing: {
                create: {
                  mrp,
                  sellingPrice,
                  costPrice: sellingPrice * 0.7,
                }
              },
              inventory: {
                create: {
                  quantityAvailable: faker.number.int({ min: 0, max: 100 }),
                  quantityReserved: faker.number.int({ min: 0, max: 10 }),
                  lowStockThreshold: 5,
                  movements: {
                    create: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => ({
                      quantity: faker.number.int({ min: -5, max: 50 }),
                      type: faker.helpers.arrayElement(['PURCHASE', 'SALE', 'ADJUSTMENT']),
                    }))
                  }
                }
              }
            };
          })
        }
      }
    });

    if (i % 50 === 0) console.log(`... ${i}/300 products created`);
  }
  
  await ensureDefaultPaymentMethods();
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

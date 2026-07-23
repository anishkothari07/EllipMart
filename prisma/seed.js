"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const client_2 = require("../lib/prisma/client");
async function main() {
    faker_1.faker.seed(2026);
    console.log('Starting deterministic seed (faker.seed(2026))...');
    // 1. Brands (20)
    const brands = [];
    for (let i = 0; i < 20; i++) {
        brands.push({
            id: faker_1.faker.string.uuid(),
            name: faker_1.faker.company.name(),
            slug: faker_1.faker.helpers.slugify(faker_1.faker.company.name() + '-' + i).toLowerCase(),
            description: faker_1.faker.company.catchPhrase(),
            isActive: true,
        });
    }
    await client_2.prisma.brand.createMany({ data: brands });
    console.log('Created 20 Brands');
    // 2. Categories (100)
    const categories = [];
    // 10 Parent Categories
    for (let i = 0; i < 10; i++) {
        categories.push({
            id: faker_1.faker.string.uuid(),
            name: faker_1.faker.commerce.department() + ` ${i}`,
            slug: faker_1.faker.helpers.slugify(faker_1.faker.commerce.department() + `-${i}`).toLowerCase(),
            parentId: null,
        });
    }
    // 90 Child Categories
    for (let i = 0; i < 90; i++) {
        categories.push({
            id: faker_1.faker.string.uuid(),
            name: faker_1.faker.commerce.productAdjective() + ' ' + faker_1.faker.commerce.department() + ` ${i}`,
            slug: faker_1.faker.helpers.slugify(`cat-child-${i}`).toLowerCase(),
            parentId: categories[faker_1.faker.number.int({ min: 0, max: 9 })].id,
        });
    }
    await client_2.prisma.category.createMany({ data: categories });
    console.log('Created 100 Categories');
    // 3. Tags (40)
    const tags = [];
    for (let i = 0; i < 40; i++) {
        const name = faker_1.faker.commerce.productAdjective() + ' ' + i;
        tags.push({
            id: faker_1.faker.string.uuid(),
            name,
            slug: faker_1.faker.helpers.slugify(name).toLowerCase(),
        });
    }
    await client_2.prisma.tag.createMany({ data: tags });
    console.log('Created 40 Tags');
    // 4. Collections (50)
    const collections = [];
    for (let i = 0; i < 50; i++) {
        collections.push({
            id: faker_1.faker.string.uuid(),
            name: `Collection ${i}`,
            slug: `collection-${i}`,
            description: faker_1.faker.lorem.sentence(),
            isAutomatic: faker_1.faker.datatype.boolean(),
        });
    }
    await client_2.prisma.collection.createMany({ data: collections });
    console.log('Created 50 Collections');
    // 5. Attributes (25) & AttributeValues (120)
    const attributeIds = [];
    for (let i = 0; i < 25; i++) {
        const attrId = faker_1.faker.string.uuid();
        attributeIds.push(attrId);
        await client_2.prisma.attribute.create({
            data: {
                id: attrId,
                name: `Attribute ${i}`,
                type: 'text',
                values: {
                    create: Array.from({ length: faker_1.faker.number.int({ min: 3, max: 6 }) }).map((_, j) => ({
                        value: `Value ${i}-${j}`,
                    })),
                },
            },
        });
    }
    console.log('Created 25 Attributes with Values');
    // 6. SpecificationGroups (10) & Specifications (1500 total, roughly 150 per group)
    for (let i = 0; i < 10; i++) {
        await client_2.prisma.specificationGroup.create({
            data: {
                id: faker_1.faker.string.uuid(),
                name: `Spec Group ${i}`,
                specs: {
                    create: Array.from({ length: 150 }).map((_, j) => ({
                        id: faker_1.faker.string.uuid(),
                        name: `Spec ${i}-${j}`,
                    })),
                },
            },
        });
    }
    console.log('Created 10 Specification Groups and 1500 Specifications');
    // Load created entities for relational mapping
    const allAttributes = await client_2.prisma.attribute.findMany({ include: { values: true } });
    const allSpecs = await client_2.prisma.specification.findMany();
    // 7. Products (300), Variants (800), Inventory (300?), Movements (2000)
    // Wait, user asked for "300 Inventory records" -> This implies only some variants have inventory, 
    // or maybe 800 inventory records (1 per variant) makes more sense. Let's create an inventory for each variant, so 800 inventories, but 2000 movements.
    console.log('Creating 300 Products with Variants, Pricing, and Inventory...');
    for (let i = 0; i < 300; i++) {
        const productId = faker_1.faker.string.uuid();
        const productTags = faker_1.faker.helpers.arrayElements(tags, faker_1.faker.number.int({ min: 1, max: 4 }));
        const productCollections = faker_1.faker.helpers.arrayElements(collections, faker_1.faker.number.int({ min: 0, max: 2 }));
        const productSpecs = faker_1.faker.helpers.arrayElements(allSpecs, faker_1.faker.number.int({ min: 2, max: 6 }));
        const numVariants = faker_1.faker.number.int({ min: 1, max: 4 });
        await client_2.prisma.product.create({
            data: {
                id: productId,
                name: faker_1.faker.commerce.productName() + ` ${i}`,
                slug: faker_1.faker.helpers.slugify(`product-${i}-${faker_1.faker.string.alphanumeric(4)}`).toLowerCase(),
                shortDescription: faker_1.faker.commerce.productDescription(),
                longDescription: faker_1.faker.lorem.paragraphs(2),
                status: faker_1.faker.helpers.arrayElement([client_1.ProductStatus.ACTIVE, client_1.ProductStatus.DRAFT]),
                visibility: faker_1.faker.helpers.arrayElement([client_1.ProductVisibility.PUBLIC, client_1.ProductVisibility.HIDDEN]),
                brandId: faker_1.faker.helpers.arrayElement(brands).id,
                categoryId: faker_1.faker.helpers.arrayElement(categories).id,
                tags: {
                    create: productTags.map(t => ({ tagId: t.id }))
                },
                collections: {
                    create: productCollections.map(c => ({ collectionId: c.id }))
                },
                specifications: {
                    create: productSpecs.map(s => ({
                        specId: s.id,
                        value: faker_1.faker.word.adjective(),
                    }))
                },
                variants: {
                    create: Array.from({ length: numVariants }).map((_, vIdx) => {
                        const variantId = faker_1.faker.string.uuid();
                        const mrp = faker_1.faker.number.float({ min: 50, max: 1000, fractionDigits: 2 });
                        const sellingPrice = faker_1.faker.number.float({ min: 20, max: mrp, fractionDigits: 2 });
                        return {
                            id: variantId,
                            sku: `SKU-${i}-${vIdx}-${faker_1.faker.string.alphanumeric(4)}`.toUpperCase(),
                            barcode: faker_1.faker.string.numeric(12),
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
                                    quantityAvailable: faker_1.faker.number.int({ min: 0, max: 100 }),
                                    quantityReserved: faker_1.faker.number.int({ min: 0, max: 10 }),
                                    lowStockThreshold: 5,
                                    movements: {
                                        create: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 4 }) }).map(() => ({
                                            quantity: faker_1.faker.number.int({ min: -5, max: 50 }),
                                            type: faker_1.faker.helpers.arrayElement(['PURCHASE', 'SALE', 'ADJUSTMENT']),
                                        }))
                                    }
                                }
                            }
                        };
                    })
                }
            }
        });
        if (i % 50 === 0)
            console.log(`... ${i}/300 products created`);
    }
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await client_2.prisma.$disconnect();
});

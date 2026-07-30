import 'dotenv/config';
import { prisma } from '../lib/prisma/client';
import { faker } from '@faker-js/faker';
import { Role, UserStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function seedCRM() {
  faker.seed(2027);

  console.log('Seeding Customers and Orders for CRM CRM module...');

  // Get some variants for orders
  const variants = await prisma.productVariant.findMany({
    take: 20,
    include: { pricing: true },
  });

  if (variants.length === 0) {
    console.error('No variants found in the database. Please seed the catalog first.');
    return;
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Create 12 Mock Customers
  const customerData = [];
  for (let i = 0; i < 12; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const phone = faker.phone.number();
    
    // Custom preferences including tags, notes, and activity timeline
    const tags = faker.helpers.arrayElements(['VIP', 'Wholesale', 'Retail', 'First Time', 'High Priority', 'Returning'], faker.number.int({ min: 1, max: 3 }));
    
    const notes = [
      {
        id: faker.string.uuid(),
        content: faker.helpers.arrayElement([
          'Prefers express delivery.',
          'Requested GST invoice for all future orders.',
          'Wholesale pricing approved for bulk orders.',
          'VIP customer, priority support.',
          'Had a dispute regarding delivery delays, resolved with a discount coupon.',
        ]),
        createdBy: 'Merchant Admin',
        createdAt: faker.date.recent({ days: 10 }).toISOString(),
      }
    ];

    const activities = [
      {
        id: faker.string.uuid(),
        type: 'ACCOUNT_CREATED',
        message: 'Customer registered on platform.',
        createdAt: faker.date.past({ years: 1 }).toISOString(),
      },
      {
        id: faker.string.uuid(),
        type: 'LOGIN',
        message: 'LoggedIn from mobile browser Chrome/iOS.',
        createdAt: faker.date.recent({ days: 2 }).toISOString(),
      }
    ];

    const savedPreferences = JSON.stringify({ tags, notes, activities });

    customerData.push({
      id: faker.string.uuid(),
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: Role.CUSTOMER,
      status: faker.helpers.arrayElement([UserStatus.ACTIVE, UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION]),
      savedPreferences,
      createdAt: faker.date.past({ years: 1 }),
    });
  }

  await prisma.user.createMany({ data: customerData });
  console.log(`Created ${customerData.length} mock customers.`);

  // Create addresses and orders for them
  for (const customer of customerData) {
    // 1-2 addresses per customer
    const addrCount = faker.number.int({ min: 1, max: 2 });
    const addresses = [];
    for (let j = 0; j < addrCount; j++) {
      addresses.push({
        id: faker.string.uuid(),
        userId: customer.id,
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        company: faker.company.name(),
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postalCode: faker.location.zipCode('######'),
        country: 'IN',
        isDefault: j === 0,
        isShipping: true,
        isBilling: true,
      });
    }
    await prisma.address.createMany({ data: addresses });

    // 0-4 orders per customer
    const orderCount = faker.number.int({ min: 0, max: 4 });
    for (let k = 0; k < orderCount; k++) {
      const orderId = faker.string.uuid();
      const orderNumber = `ORD-${faker.number.int({ min: 100000, max: 999999 })}`;
      
      const numItems = faker.number.int({ min: 1, max: 3 });
      const orderItems = [];
      let subTotal = 0;

      for (let itemIdx = 0; itemIdx < numItems; itemIdx++) {
        const variant = faker.helpers.arrayElement(variants);
        const qty = faker.number.int({ min: 1, max: 3 });
        const price = Number(variant.pricing?.sellingPrice || 199.99);
        const total = price * qty;
        subTotal += total;

        orderItems.push({
          id: faker.string.uuid(),
          orderId,
          variantId: variant.id,
          productName: variant.name || 'Sample Product',
          sku: variant.sku,
          quantity: qty,
          unitPrice: price,
          totalPrice: total,
        });
      }

      const shippingCost = faker.number.int({ min: 0, max: 1 }) * 50;
      const grandTotal = subTotal + shippingCost;
      const status = faker.helpers.arrayElement([
        OrderStatus.DELIVERED,
        OrderStatus.SHIPPED,
        OrderStatus.PROCESSING,
        OrderStatus.PENDING_PAYMENT,
      ]);

      const o = await prisma.order.create({
        data: {
          id: orderId,
          orderNumber,
          userId: customer.id,
          subTotal,
          grandTotal,
          shippingTotal: shippingCost,
          status,
          shippingName: addresses[0].fullName,
          shippingPhone: addresses[0].phone,
          shippingStreet: addresses[0].street,
          shippingCity: addresses[0].city,
          shippingState: addresses[0].state,
          shippingCountry: addresses[0].country,
          shippingPostalCode: addresses[0].postalCode,
          items: {
            create: orderItems,
          },
          payment: {
            create: {
              amount: grandTotal,
              status: status === OrderStatus.DELIVERED || status === OrderStatus.SHIPPED || status === OrderStatus.PROCESSING
                ? PaymentStatus.CAPTURED
                : PaymentStatus.PENDING,
              provider: 'RAZORPAY',
              paymentMethodCode: 'UPI',
            }
          }
        }
      });

      // Update CRM activity timeline for order placing
      const parsedPrefs = JSON.parse(customer.savedPreferences);
      parsedPrefs.activities.push({
        id: faker.string.uuid(),
        type: 'ORDER_PLACED',
        message: `Placed order #${orderNumber} for ₹${grandTotal.toFixed(2)}`,
        createdAt: o.createdAt.toISOString(),
      });
      await prisma.user.update({
        where: { id: customer.id },
        data: { savedPreferences: JSON.stringify(parsedPrefs) },
      });
    }
  }

  console.log('CRM Seeding Complete!');
}

seedCRM()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

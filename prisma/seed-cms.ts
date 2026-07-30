import 'dotenv/config';
import { prisma } from '../lib/prisma/client';
import { cloneWebsite, updateWebsiteDraft } from '../app/admin/corecart/actions';
import { publishWebsite } from '../lib/corecart/compiler';

async function main() {
  console.log('Seeding Reference Commerce Model & Storefronts...');

  // 1. Seed Component Registry definitions
  const registryHero = await prisma.componentRegistry.upsert({
    where: { id: 'hero-banner-registry' },
    update: {},
    create: {
      id: 'hero-banner-registry',
      name: 'HeroBanner',
      schema: '{}',
      version: '1.0.0',
    },
  });

  const registryGrid = await prisma.componentRegistry.upsert({
    where: { id: 'product-grid-registry' },
    update: {},
    create: {
      id: 'product-grid-registry',
      name: 'ProductGrid',
      schema: '{}',
      version: '1.0.0',
    },
  });

  const registryNewsletter = await prisma.componentRegistry.upsert({
    where: { id: 'newsletter-registry' },
    update: {},
    create: {
      id: 'newsletter-registry',
      name: 'Newsletter',
      schema: '{}',
      version: '1.0.0',
    },
  });

  console.log('Component Registry Seeded.');

  // 2. Clean up existing storefront data for clean re-seed
  const handles = [
    'smartgo-storefront-header',
    'smartgo-storefront-footer',
    'electromart-storefront-header',
    'electromart-storefront-footer'
  ];

  await prisma.$transaction([
    prisma.websiteMenu.deleteMany({}),
    prisma.websiteNavigation.deleteMany({}),
    prisma.websiteComponentProperty.deleteMany({}),
    prisma.websiteComponent.deleteMany({}),
    prisma.websiteSection.deleteMany({}),
    prisma.websitePage.deleteMany({}),
    prisma.websiteLayout.deleteMany({}),
    prisma.themeToken.deleteMany({}),
    prisma.websiteTheme.deleteMany({}),
    prisma.websiteDraft.deleteMany({}),
    prisma.websiteVersion.deleteMany({}),
    prisma.websiteSettings.deleteMany({}),
    prisma.websiteAIConfig.deleteMany({}),
    prisma.pageRoute.deleteMany({}),
    prisma.website.deleteMany({}),
  ]);

  console.log('Stale tenant data cleared.');

  // 3. Create core Reference Commerce Model definition
  const reference = await prisma.website.create({
    data: {
      id: 'reference-commerce-model',
      name: 'Reference Commerce Model',
      domain: 'reference.localhost',
    },
  });

  await prisma.websiteSettings.create({
    data: {
      websiteId: reference.id,
      brandName: 'CoreCart Reference',
      websiteName: 'Reference Commerce Storefront',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      tagline: 'Standard Storefront System Template',
      defaultCurrency: 'INR',
      defaultLanguage: 'en',
      searchPlaceholder: 'Search products...',
      copyright: '© CoreCart reference model. All Rights Reserved.',
    },
  });

  await prisma.websiteAIConfig.create({
    data: {
      websiteId: reference.id,
      assistantName: 'Reference AI Copilot',
      greeting: 'Welcome! I can help you find models or ask queries.',
      suggestionsJson: JSON.stringify(['Show featured products', 'Help me choose']),
    },
  });

  await prisma.websiteDraft.create({
    data: {
      websiteId: reference.id,
      name: 'Reference Model Draft',
    },
  });

  const refTheme = await prisma.websiteTheme.create({
    data: {
      id: 'reference-theme',
      websiteId: reference.id,
      name: 'Reference Default Theme',
      isActive: true,
    },
  });

  const defaultTokens = [
    { key: '--color-primary', value: '#FF5733' },
    { key: '--color-secondary', value: '#232320' },
    { key: '--color-accent', value: '#E2B13C' },
    { key: '--color-background', value: '#FBFBF9' },
    { key: '--color-text', value: '#232320' },
    { key: '--radius', value: '1.0rem' },
  ];

  for (const t of defaultTokens) {
    await prisma.themeToken.create({
      data: {
        themeId: refTheme.id,
        key: t.key,
        value: t.value,
      },
    });
  }

  const refLayout = await prisma.websiteLayout.create({
    data: {
      id: 'reference-layout',
      themeId: refTheme.id,
      name: 'Reference Layout',
    },
  });

  const refPage = await prisma.websitePage.create({
    data: {
      id: 'reference-homepage',
      layoutId: refLayout.id,
      title: 'Reference Home',
      slug: 'home',
      isPublished: true,
    },
  });

  await prisma.pageRoute.create({
    data: {
      pageId: refPage.id,
      routePath: '/',
    },
  });

  // Hero Section
  const refHeroSection = await prisma.websiteSection.create({
    data: {
      id: 'reference-hero-section',
      pageId: refPage.id,
      name: 'Hero Section',
      sortOrder: 0,
    },
  });

  const refHeroComponent = await prisma.websiteComponent.create({
    data: {
      id: 'reference-hero-component',
      sectionId: refHeroSection.id,
      registryId: registryHero.id,
      sortOrder: 0,
    },
  });

  const refHeroProps = [
    { id: 'ref-h-title', componentId: refHeroComponent.id, key: 'title', literalValue: 'Standard CoreCart Campaign Header', schemaType: 'string' },
    { id: 'ref-h-sub', componentId: refHeroComponent.id, key: 'subtitle', literalValue: 'A fully normalized, dynamic and extensible storefront template system.', schemaType: 'string' },
    { id: 'ref-h-img', componentId: refHeroComponent.id, key: 'imageUrl', literalValue: '/images/hero-home.png', schemaType: 'string' },
    { id: 'ref-h-btn', componentId: refHeroComponent.id, key: 'buttonText', literalValue: 'Explore Catalog', schemaType: 'string' },
    { id: 'ref-h-url', componentId: refHeroComponent.id, key: 'buttonUrl', literalValue: '/search', schemaType: 'string' },
  ];

  for (const p of refHeroProps) {
    await prisma.websiteComponentProperty.create({ data: p });
  }

  // Grid Section
  const refGridSection = await prisma.websiteSection.create({
    data: {
      id: 'reference-grid-section',
      pageId: refPage.id,
      name: 'Product Grid Section',
      sortOrder: 1,
    },
  });

  const refGridComponent = await prisma.websiteComponent.create({
    data: {
      id: 'reference-grid-component',
      sectionId: refGridSection.id,
      registryId: registryGrid.id,
      sortOrder: 0,
    },
  });

  await prisma.websiteComponentProperty.create({
    data: {
      id: 'ref-g-title',
      componentId: refGridComponent.id,
      key: 'title',
      literalValue: 'Featured Collections',
      schemaType: 'string',
    },
  });

  // Newsletter Section
  const refNewsSection = await prisma.websiteSection.create({
    data: {
      id: 'reference-news-section',
      pageId: refPage.id,
      name: 'Newsletter Section',
      sortOrder: 2,
    },
  });

  const refNewsComponent = await prisma.websiteComponent.create({
    data: {
      id: 'reference-news-component',
      sectionId: refNewsSection.id,
      registryId: registryNewsletter.id,
      sortOrder: 0,
    },
  });

  await prisma.websiteComponentProperty.create({
    data: {
      id: 'ref-n-title',
      componentId: refNewsComponent.id,
      key: 'title',
      literalValue: 'Join the CoreCart Community',
      schemaType: 'string',
    },
  });

  // Navigation menus
  const refHeader = await prisma.websiteNavigation.create({
    data: {
      websiteId: reference.id,
      handle: 'reference-header',
      name: 'Reference Main Header',
      type: 'HEADER',
    },
  });

  await prisma.websiteMenu.create({
    data: {
      navigationId: refHeader.id,
      label: 'Shop All',
      url: '/search',
    },
  });

  const refFooter = await prisma.websiteNavigation.create({
    data: {
      websiteId: reference.id,
      handle: 'reference-footer',
      name: 'Reference Footer Menu',
      type: 'FOOTER',
    },
  });

  await prisma.websiteMenu.create({
    data: {
      navigationId: refFooter.id,
      label: 'Returns & Refunds',
      url: '/returns',
    },
  });

  console.log('Reference Commerce Model template created successfully.');

  // 4. Clone to SmartGO Classic
  console.log('Cloning Reference Commerce Model to SmartGO Classic...');
  const smartgo = await cloneWebsite('reference-commerce-model', 'SmartGO Classic', 'localhost');

  // Customize SmartGO settings & design token values
  const smartgoPayload = {
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    appName: 'SmartGO Classic',
    companyName: 'SmartGO India Pvt Ltd',
    tagline: 'Diwali special offers and items',
    tokens: {
      '--color-primary': '#FF5733',
      '--color-secondary': '#232320',
      '--color-accent': '#E2B13C',
      '--color-background': '#FBFBF9',
      '--color-text': '#232320',
      '--radius': '1.0rem',
    },
    header: [
      { label: 'Shop All', url: '/search' },
      { label: 'Diwali Special', url: '/search?category=diwali' },
      { label: 'Support', url: '/support' },
    ],
    footer: [
      { label: 'About Us', url: '/about' },
      { label: 'Returns & Refunds', url: '/returns' },
      { label: 'Terms of Service', url: '/terms' },
    ],
  };

  await updateWebsiteDraft(smartgo.id, smartgoPayload);

  // Customize SmartGO Hero Component text properties specifically
  const sgHeroComp = await prisma.websiteComponent.findFirst({
    where: {
      section: {
        page: {
          layout: {
            theme: { websiteId: smartgo.id }
          }
        }
      },
      registryId: registryHero.id,
    },
  });

  if (sgHeroComp) {
    await prisma.websiteComponentProperty.updateMany({
      where: { componentId: sgHeroComp.id, key: 'title' },
      data: { literalValue: 'SmartGO Diwali Special' },
    });
    await prisma.websiteComponentProperty.updateMany({
      where: { componentId: sgHeroComp.id, key: 'subtitle' },
      data: { literalValue: 'Elevate your festive shopping with curated premium models.' },
    });
  }

  // Customize SmartGO AI Configuration setting defaults
  await prisma.websiteAIConfig.update({
    where: { websiteId: smartgo.id },
    data: {
      assistantName: 'SmartGO Assistant',
      greeting: 'Welcome to SmartGO! Looking for Diwali Specials?',
      suggestionsJson: JSON.stringify(['Diwali special items', 'Fastest deliveries']),
    },
  });

  // Compile and Publish SmartGO
  const pubSg = await publishWebsite(smartgo.id);
  if (pubSg.valid) {
    console.log('SmartGO compiled manifest published.');
  } else {
    console.error('Failed compiling SmartGO manifest:', pubSg.errors);
  }

  // 5. Clone to ElectroMart Superstore
  console.log('Cloning Reference Commerce Model to ElectroMart Superstore...');
  const electromart = await cloneWebsite('reference-commerce-model', 'ElectroMart Superstore', 'electromart.localhost');

  const electroPayload = {
    logoUrl: '/electromart-logo.png',
    faviconUrl: '/favicon.ico',
    appName: 'ElectroMart',
    companyName: 'ElectroMart India Group',
    tagline: 'Powering your home with electric pricing',
    tokens: {
      '--color-primary': '#3B82F6',
      '--color-secondary': '#111827',
      '--color-accent': '#10B981',
      '--color-background': '#F3F4F6',
      '--color-text': '#111827',
      '--radius': '0.5rem',
    },
    header: [
      { label: 'Hot Deals', url: '/search?deals=true' },
      { label: 'Apples & Electronics', url: '/search?category=electronics' },
    ],
    footer: [{ label: 'Customer Support', url: '/help' }],
  };

  await updateWebsiteDraft(electromart.id, electroPayload);

  // Customize ElectroMart Hero Component text properties specifically
  const emHeroComp = await prisma.websiteComponent.findFirst({
    where: {
      section: {
        page: {
          layout: {
            theme: { websiteId: electromart.id }
          }
        }
      },
      registryId: registryHero.id,
    },
  });

  if (emHeroComp) {
    await prisma.websiteComponentProperty.updateMany({
      where: { componentId: emHeroComp.id, key: 'title' },
      data: { literalValue: 'ElectroMart Electronics Blowout' },
    });
    await prisma.websiteComponentProperty.updateMany({
      where: { componentId: emHeroComp.id, key: 'subtitle' },
      data: { literalValue: 'Save up to 50% on all smart gadgets and electrical appliances.' },
    });
    await prisma.websiteComponentProperty.updateMany({
      where: { componentId: emHeroComp.id, key: 'buttonText' },
      data: { literalValue: 'See Electro Deals' },
    });
  }

  // Customize ElectroMart AI Configuration setting defaults
  await prisma.websiteAIConfig.update({
    where: { websiteId: electromart.id },
    data: {
      assistantName: 'Electro Helper',
      greeting: 'Powering your shopping! How can I help you find smart gadgets today?',
      suggestionsJson: JSON.stringify(['Hot deals', 'Smartphones under 15000']),
    },
  });

  // Compile and Publish ElectroMart
  const pubEm = await publishWebsite(electromart.id);
  if (pubEm.valid) {
    console.log('ElectroMart compiled manifest published.');
  } else {
    console.error('Failed compiling ElectroMart manifest:', pubEm.errors);
  }

  console.log('CMS Normalized Clone Seeder Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

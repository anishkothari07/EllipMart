import 'dotenv/config';
import { prisma } from '../lib/prisma/client';
import { publishWebsite } from '../lib/corecart/compiler';

async function main() {
  console.log('Seeding SmartGO Storefront CMS...');

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

  const registryCategoryShowcase = await prisma.componentRegistry.upsert({
    where: { id: 'category-showcase-registry' },
    update: {},
    create: {
      id: 'category-showcase-registry',
      name: 'CategoryShowcase',
      schema: '{}',
      version: '1.0.0',
    },
  });

  const registryTestimonials = await prisma.componentRegistry.upsert({
    where: { id: 'testimonials-registry' },
    update: {},
    create: {
      id: 'testimonials-registry',
      name: 'Testimonials',
      schema: '{}',
      version: '1.0.0',
    },
  });

  const registryTrustBar = await prisma.componentRegistry.upsert({
    where: { id: 'trust-bar-registry' },
    update: {},
    create: {
      id: 'trust-bar-registry',
      name: 'TrustBar',
      schema: '{}',
      version: '1.0.0',
    },
  });

  const registryPromoBanner = await prisma.componentRegistry.upsert({
    where: { id: 'promo-banner-registry' },
    update: {},
    create: {
      id: 'promo-banner-registry',
      name: 'PromoBanner',
      schema: '{}',
      version: '1.0.0',
    },
  });

  console.log('Component Registry Seeded.');

  // 2. Clean up existing storefront data for clean re-seed

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

  // 3. Create core SmartGO website definition
  const smartgo = await prisma.website.create({
    data: {
      id: 'smartgo-storefront',
      name: 'SmartGO',
      domain: 'localhost',
    },
  });

  await prisma.websiteSettings.create({
    data: {
      websiteId: smartgo.id,
      brandName: 'SmartGO',
      websiteName: 'SmartGO',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      tagline: 'Diwali special offers and items',
      defaultCurrency: 'INR',
      defaultLanguage: 'en',
      searchPlaceholder: 'Search products...',
      copyright: '© SmartGO India Pvt Ltd. All Rights Reserved.',
      announcementsJson: JSON.stringify([
        'Complimentary shipping on qualifying orders',
        'Members get early access to seasonal drops',
        'Easy 30-day returns, always'
      ]),
      trendingSearchesJson: JSON.stringify([
        'Wireless headphones',
        'Trench coat',
        'Leather tote',
        'Skincare serum',
        'Lounge chair',
        'Sneakers'
      ]),
      paymentBadgesJson: JSON.stringify(['VISA', 'MC', 'AMEX', 'PAYPAL', 'APPLE', 'GPAY']),
      socialLinksJson: JSON.stringify({
        instagram: '#',
        twitter: '#',
        facebook: '#',
        youtube: '#'
      }),
      megaMenuFeaturedJson: JSON.stringify({
        title: 'Autumn Luxury Edit',
        subtitle: 'Discover the season’s most coveted pieces',
        image: '/images/cat-fashion.png',
        href: '/category/fashion'
      }),
    },
  });

  await prisma.websiteAIConfig.create({
    data: {
      websiteId: smartgo.id,
      assistantName: 'SmartGO Assistant',
      greeting: 'Welcome to SmartGO! Looking for Diwali Specials?',
      suggestionsJson: JSON.stringify(['Diwali special items', 'Fastest deliveries']),
    },
  });

  await prisma.websiteDraft.create({
    data: {
      websiteId: smartgo.id,
      name: 'SmartGO Draft',
    },
  });

  const smartgoTheme = await prisma.websiteTheme.create({
    data: {
      id: 'smartgo-theme',
      websiteId: smartgo.id,
      name: 'SmartGO Default Theme',
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
        themeId: smartgoTheme.id,
        key: t.key,
        value: t.value,
      },
    });
  }

  const smartgoLayout = await prisma.websiteLayout.create({
    data: {
      id: 'smartgo-layout',
      themeId: smartgoTheme.id,
      name: 'SmartGO Layout',
    },
  });

  const smartgoPage = await prisma.websitePage.create({
    data: {
      id: 'smartgo-homepage',
      layoutId: smartgoLayout.id,
      title: 'SmartGO Home',
      slug: 'home',
      isPublished: true,
    },
  });

  await prisma.pageRoute.create({
    data: {
      pageId: smartgoPage.id,
      routePath: '/',
    },
  });

  // Hero Section (sortOrder 0)
  const refHeroSection = await prisma.websiteSection.create({
    data: {
      id: 'smartgo-hero-section',
      pageId: smartgoPage.id,
      name: 'Hero Section',
      sortOrder: 0,
    },
  });

  const smartgoHeroComponent = await prisma.websiteComponent.create({
    data: {
      id: 'smartgo-hero-component',
      sectionId: refHeroSection.id,
      registryId: registryHero.id,
      sortOrder: 0,
    },
  });

  const refHeroProps = [
    { id: 'ref-h-title', componentId: smartgoHeroComponent.id, key: 'title', literalValue: 'SmartGO Diwali Special', schemaType: 'string' },
    { id: 'ref-h-sub', componentId: smartgoHeroComponent.id, key: 'subtitle', literalValue: 'Elevate your festive shopping with curated premium models.', schemaType: 'string' },
    { id: 'ref-h-img', componentId: smartgoHeroComponent.id, key: 'imageUrl', literalValue: '/images/hero-home.png', schemaType: 'string' },
    { id: 'ref-h-btn', componentId: smartgoHeroComponent.id, key: 'buttonText', literalValue: 'Explore Diwali Deals', schemaType: 'string' },
    { id: 'ref-h-url', componentId: smartgoHeroComponent.id, key: 'buttonUrl', literalValue: '/search', schemaType: 'string' },
  ];

  for (const p of refHeroProps) {
    await prisma.websiteComponentProperty.create({ data: p });
  }

  // Trust Bar Section (sortOrder 1)
  const refTrustSection = await prisma.websiteSection.create({
    data: {
      id: 'smartgo-trust-section',
      pageId: smartgoPage.id,
      name: 'Trust Bar Section',
      sortOrder: 1,
    },
  });

  const refTrustComponent = await prisma.websiteComponent.create({
    data: {
      id: 'smartgo-trust-component',
      sectionId: refTrustSection.id,
      registryId: registryTrustBar.id,
      sortOrder: 0,
    },
  });

  await prisma.websiteComponentProperty.create({
    data: {
      id: 'ref-tr-items',
      componentId: refTrustComponent.id,
      key: 'items',
      literalValue: JSON.stringify([
        { title: 'Free standard delivery', subtitle: 'On all orders, no minimum required' },
        { title: 'Same-day dispatch', subtitle: 'Order before 2pm local time' },
        { title: 'Seamless returns', subtitle: '30-day trial period, prepaid label' },
        { title: 'Carbon neutral', subtitle: 'Offsets on every shipment' }
      ]),
      schemaType: 'string',
    },
  });

  // Category Showcase Section (sortOrder 2)
  const refCatSection = await prisma.websiteSection.create({
    data: {
      id: 'smartgo-cat-section',
      pageId: smartgoPage.id,
      name: 'Category Showcase Section',
      sortOrder: 2,
    },
  });

  const refCatComponent = await prisma.websiteComponent.create({
    data: {
      id: 'smartgo-cat-component',
      sectionId: refCatSection.id,
      registryId: registryCategoryShowcase.id,
      sortOrder: 0,
    },
  });

  const refCatProps = [
    { id: 'ref-c-eyebrow', componentId: refCatComponent.id, key: 'eyebrow', literalValue: 'Shop by category', schemaType: 'string' },
    { id: 'ref-c-title', componentId: refCatComponent.id, key: 'title', literalValue: 'Curated collections for every corner of your life', schemaType: 'string' },
    { id: 'ref-c-href', componentId: refCatComponent.id, key: 'viewAllHref', literalValue: '/category/all', schemaType: 'string' },
    {
      id: 'ref-c-categories',
      componentId: refCatComponent.id,
      key: 'categories',
      literalValue: JSON.stringify([
        { id: 'c1', name: 'Fashion', slug: 'fashion', image: '/images/cat-fashion.png', productCount: 1284 },
        { id: 'c2', name: 'Technology', slug: 'tech', image: '/images/cat-tech.png', productCount: 642 },
        { id: 'c3', name: 'Home & Living', slug: 'home', image: '/images/cat-home.png', productCount: 918 },
        { id: 'c4', name: 'Beauty', slug: 'beauty', image: '/images/cat-beauty.png', productCount: 473 },
        { id: 'c5', name: 'Footwear', slug: 'footwear', image: '/images/cat-footwear.png', productCount: 356 },
        { id: 'c6', name: 'Accessories', slug: 'accessories', image: '/images/cat-accessories.png', productCount: 521 },
      ]),
      schemaType: 'string',
    },
  ];

  for (const p of refCatProps) {
    await prisma.websiteComponentProperty.create({ data: p });
  }

  // Grid Section (sortOrder 3)
  const refGridSection = await prisma.websiteSection.create({
    data: {
      id: 'smartgo-grid-section',
      pageId: smartgoPage.id,
      name: 'Product Grid Section',
      sortOrder: 3,
    },
  });

  const refGridComponent = await prisma.websiteComponent.create({
    data: {
      id: 'smartgo-grid-component',
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

  // Promo Banner Section (sortOrder 4)
  const refPromoSection = await prisma.websiteSection.create({
    data: {
      id: 'smartgo-promo-section',
      pageId: smartgoPage.id,
      name: 'Promo Banner Section',
      sortOrder: 4,
    },
  });

  const refPromoComponent = await prisma.websiteComponent.create({
    data: {
      id: 'smartgo-promo-component',
      sectionId: refPromoSection.id,
      registryId: registryPromoBanner.id,
      sortOrder: 0,
    },
  });

  const refPromoProps = [
    { id: 'ref-pr-title', componentId: refPromoComponent.id, key: 'title', literalValue: 'Season Transition Edit', schemaType: 'string' },
    { id: 'ref-pr-subtitle', componentId: refPromoComponent.id, key: 'subtitle', literalValue: 'Considered layers and lightweight knits engineered to welcome warmer days.', schemaType: 'string' },
    { id: 'ref-pr-img', componentId: refPromoComponent.id, key: 'image', literalValue: '/images/hero-home.png', schemaType: 'string' },
    { id: 'ref-pr-cta', componentId: refPromoComponent.id, key: 'ctaLabel', literalValue: 'Explore the drop', schemaType: 'string' },
    { id: 'ref-pr-href', componentId: refPromoComponent.id, key: 'ctaHref', literalValue: '/category/new-arrivals', schemaType: 'string' },
  ];

  for (const p of refPromoProps) {
    await prisma.websiteComponentProperty.create({ data: p });
  }

  // Testimonials Section (sortOrder 5)
  const refTestimonialsSection = await prisma.websiteSection.create({
    data: {
      id: 'smartgo-testimonials-section',
      pageId: smartgoPage.id,
      name: 'Testimonials Section',
      sortOrder: 5,
    },
  });

  const refTestimonialsComponent = await prisma.websiteComponent.create({
    data: {
      id: 'smartgo-testimonials-component',
      sectionId: refTestimonialsSection.id,
      registryId: registryTestimonials.id,
      sortOrder: 0,
    },
  });

  await prisma.websiteComponentProperty.create({
    data: {
      id: 'ref-test-items',
      componentId: refTestimonialsComponent.id,
      key: 'items',
      literalValue: JSON.stringify([
        { id: 't1', author: 'Sofia Marchetti', role: 'Verified buyer', quote: 'This store has completely changed how I shop online. The quality is consistently excellent and delivery is unbelievably fast.', rating: 5 },
        { id: 't2', author: 'James Okafor', role: 'Verified buyer', quote: 'Every order feels like unwrapping a gift. The packaging, the products, the little details — all considered.', rating: 5 },
        { id: 't3', author: 'Mei Lin', order: 0, role: 'Verified buyer', quote: 'Finally a store that feels premium without the premium hassle. Returns are painless and support is superb.', rating: 5 }
      ]),
      schemaType: 'string',
    },
  });

  await prisma.websiteComponentProperty.create({
    data: {
      id: 'ref-test-eyebrow',
      componentId: refTestimonialsComponent.id,
      key: 'eyebrow',
      literalValue: 'Loved by thousands',
      schemaType: 'string',
    },
  });

  await prisma.websiteComponentProperty.create({
    data: {
      id: 'ref-test-title',
      componentId: refTestimonialsComponent.id,
      key: 'title',
      literalValue: 'What our customers are saying',
      schemaType: 'string',
    },
  });

  // Newsletter Section (sortOrder 6)
  const refNewsSection = await prisma.websiteSection.create({
    data: {
      id: 'smartgo-news-section',
      pageId: smartgoPage.id,
      name: 'Newsletter Section',
      sortOrder: 6,
    },
  });

  const refNewsComponent = await prisma.websiteComponent.create({
    data: {
      id: 'smartgo-news-component',
      sectionId: refNewsSection.id,
      registryId: registryNewsletter.id,
      sortOrder: 0,
    },
  });

  const refNewsProps = [
    { id: 'ref-n-title', componentId: refNewsComponent.id, key: 'title', literalValue: 'Join the CoreCart Community', schemaType: 'string' },
    { id: 'ref-n-desc', componentId: refNewsComponent.id, key: 'description', literalValue: 'Early access to drops, members-only pricing, and a little something for your first order.', schemaType: 'string' },
    { id: 'ref-n-btn', componentId: refNewsComponent.id, key: 'buttonText', literalValue: 'Subscribe', schemaType: 'string' },
    { id: 'ref-n-ph', componentId: refNewsComponent.id, key: 'placeholder', literalValue: 'you@example.com', schemaType: 'string' },
  ];

  for (const p of refNewsProps) {
    await prisma.websiteComponentProperty.create({ data: p });
  }

  // Navigation menus
  const refHeader = await prisma.websiteNavigation.create({
    data: {
      websiteId: smartgo.id,
      handle: 'smartgo-header',
      name: 'SmartGO Main Header',
      type: 'HEADER',
    },
  });

  const headerLinks = [
    { label: 'New', url: '/category/new-arrivals', sortOrder: 0 },
    { label: 'Women', url: '/category/fashion', sortOrder: 1 },
    { label: 'Men', url: '/category/fashion', sortOrder: 2 },
    { label: 'Tech', url: '/category/tech', sortOrder: 3 },
    { label: 'Home', url: '/category/home', sortOrder: 4 },
    { label: 'Beauty', url: '/category/beauty', sortOrder: 5 },
    { label: 'Sale', url: '/category/sale', sortOrder: 6 },
  ];

  for (const link of headerLinks) {
    await prisma.websiteMenu.create({
      data: {
        navigationId: refHeader.id,
        label: link.label,
        url: link.url,
        sortOrder: link.sortOrder,
      },
    });
  }

  const refMegaMenu = await prisma.websiteNavigation.create({
    data: {
      websiteId: smartgo.id,
      handle: 'smartgo-megamenu',
      name: 'SmartGO Mega Menu',
      type: 'MEGA_MENU',
    },
  });

  const shopRoot = await prisma.websiteMenu.create({
    data: {
      navigationId: refMegaMenu.id,
      label: 'Shop',
      url: '/category/all',
      sortOrder: 0,
    },
  });

  const columns = [
    {
      label: 'Categories',
      url: '/category/all',
      sortOrder: 0,
      links: [
        { label: 'Fashion', url: '/category/fashion' },
        { label: 'Technology', url: '/category/tech' },
        { label: 'Home & Living', url: '/category/home' },
        { label: 'Beauty', url: '/category/beauty' },
        { label: 'Footwear', url: '/category/footwear' },
        { label: 'Accessories', url: '/category/accessories' },
      ],
    },
    {
      label: 'Collections',
      url: '/category/all',
      sortOrder: 1,
      links: [
        { label: 'The Essentials', url: '/category/all' },
        { label: 'New Arrivals', url: '/category/new-arrivals' },
        { label: 'Best Sellers', url: '/category/all' },
        { label: 'Luxury Edit', url: '/category/all' },
        { label: 'Gifts', url: '/category/all' },
      ],
    },
    {
      label: 'Support',
      url: '/category/all',
      sortOrder: 2,
      links: [
        { label: 'Track Order', url: '/account/orders' },
        { label: 'Returns', url: '/account/returns' },
        { label: 'Shipping', url: '/category/all' },
        { label: 'Contact Us', url: '/category/all' },
      ],
    },
  ];

  for (const col of columns) {
    const colNode = await prisma.websiteMenu.create({
      data: {
        navigationId: refMegaMenu.id,
        label: col.label,
        url: col.url,
        parentId: shopRoot.id,
        sortOrder: col.sortOrder,
      },
    });

    for (let i = 0; i < col.links.length; i++) {
      await prisma.websiteMenu.create({
        data: {
          navigationId: refMegaMenu.id,
          label: col.links[i].label,
          url: col.links[i].url,
          parentId: colNode.id,
          sortOrder: i,
        },
      });
    }
  }

  const refFooter = await prisma.websiteNavigation.create({
    data: {
      websiteId: smartgo.id,
      handle: 'smartgo-footer',
      name: 'SmartGO Footer Menu',
      type: 'FOOTER',
    },
  });

  const footerLinks = [
    { label: 'About Us', url: '/about', sortOrder: 0 },
    { label: 'Returns & Refunds', url: '/returns', sortOrder: 1 },
    { label: 'Terms of Service', url: '/terms', sortOrder: 2 },
    { label: 'Privacy Policy', url: '/privacy', sortOrder: 3 },
  ];

  for (const link of footerLinks) {
    await prisma.websiteMenu.create({
      data: {
        navigationId: refFooter.id,
        label: link.label,
        url: link.url,
        sortOrder: link.sortOrder,
      },
    });
  }

  console.log('SmartGO website definition seeded successfully.');

  // Compile and Publish SmartGO directly
  console.log('Compiling and publishing SmartGO storefront manifest payload...');
  const pubSg = await publishWebsite(smartgo.id);
  if (pubSg.valid) {
    console.log('SmartGO compiled manifest payload successfully published.');
  } else {
    console.error('Failed compiling SmartGO manifest:', pubSg.errors);
  }

  console.log('CMS Direct Seeder Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { componentRegistry, validatePropsAgainstSchema } from './component-registry';
import { CoreCartComponent, ComponentSchema } from './types';

const HeroBannerSchema: ComponentSchema = {
  properties: {
    title: { type: 'string', required: true },
    subtitle: { type: 'string' },
    imageUrl: { type: 'string', required: true },
    buttonText: { type: 'string' },
    buttonUrl: { type: 'string' },
  },
};

const ProductGridSchema: ComponentSchema = {
  properties: {
    title: { type: 'string', required: true },
    limit: { type: 'number' },
    columns: { type: 'number' },
  },
};

const NewsletterSchema: ComponentSchema = {
  properties: {
    title: { type: 'string', required: true },
    description: { type: 'string' },
  },
};

const CategoryShowcaseSchema: ComponentSchema = {
  properties: {
    eyebrow: { type: 'string' },
    title: { type: 'string', required: true },
    viewAllHref: { type: 'string' },
    categories: { type: 'string' },
  },
};

const TestimonialsSchema: ComponentSchema = {
  properties: {
    items: { type: 'string', required: true },
  },
};

const TrustBarSchema: ComponentSchema = {
  properties: {
    items: { type: 'string', required: true },
  },
};

const PromoBannerSchema: ComponentSchema = {
  properties: {
    title: { type: 'string', required: true },
    subtitle: { type: 'string' },
    image: { type: 'string', required: true },
    ctaLabel: { type: 'string' },
    ctaHref: { type: 'string' },
  },
};

export function registerDefaultComponents() {
  componentRegistry.register({
    type: 'HeroBanner',
    schema: HeroBannerSchema,
    validate: (props) => validatePropsAgainstSchema(props, HeroBannerSchema),
    render: () => null, // Managed by React Dynamic Renderer
  });

  componentRegistry.register({
    type: 'ProductGrid',
    schema: ProductGridSchema,
    validate: (props) => validatePropsAgainstSchema(props, ProductGridSchema),
    render: () => null,
  });

  componentRegistry.register({
    type: 'Newsletter',
    schema: NewsletterSchema,
    validate: (props) => validatePropsAgainstSchema(props, NewsletterSchema),
    render: () => null,
  });

  componentRegistry.register({
    type: 'CategoryShowcase',
    schema: CategoryShowcaseSchema,
    validate: (props) => validatePropsAgainstSchema(props, CategoryShowcaseSchema),
    render: () => null,
  });

  componentRegistry.register({
    type: 'Testimonials',
    schema: TestimonialsSchema,
    validate: (props) => validatePropsAgainstSchema(props, TestimonialsSchema),
    render: () => null,
  });

  componentRegistry.register({
    type: 'TrustBar',
    schema: TrustBarSchema,
    validate: (props) => validatePropsAgainstSchema(props, TrustBarSchema),
    render: () => null,
  });

  componentRegistry.register({
    type: 'PromoBanner',
    schema: PromoBannerSchema,
    validate: (props) => validatePropsAgainstSchema(props, PromoBannerSchema),
    render: () => null,
  });
}

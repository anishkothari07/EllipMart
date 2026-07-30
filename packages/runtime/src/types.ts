export interface RuntimeManifest {
  websiteId: string;
  name: string;
  host: string;
  settings: {
    brandName?: string;
    websiteName?: string;
    logoUrl?: string;
    faviconUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    businessAddress?: string;
    contactAddress?: string;
    defaultCurrency: string;
    defaultLanguage: string;
    searchPlaceholder: string;
    copyright?: string;
    tagline?: string;
    companyName?: string;
    supportEmail?: string;
    supportPhone?: string;
    socialLinks?: Record<string, string>;
    paymentBadges?: string[];
    announcements?: string[];
    trendingSearches?: string[];
    megaMenuFeatured?: {
      title: string;
      subtitle: string;
      image: string;
      href: string;
    };
  };
  theme: {
    id: string;
    name: string;
    tokens: Record<string, string>; // CSS variables dynamically generated from ThemeTokens
  };
  navigation: Record<string, NavigationItemManifest[]>; // Maps navigation container type (e.g. "HEADER") to list of items
  pages: Record<string, PageManifest>; // Mapped by route path, e.g. "/" or "/about"
  seo: {
    title?: string;
    description?: string;
    canonical?: string;
    robots?: string;
    twitterCard?: string;
  };
  ai: {
    assistantName: string;
    avatarUrl?: string;
    greeting: string;
    suggestions: string[];
    prompt?: string;
    model: string;
    temperature: number;
    tone: string;
    enableSearch: boolean;
    enableCompare: boolean;
    enableRecommendations: boolean;
  };
  scripts: {
    placement: 'HEAD' | 'BODY';
    code: string;
  }[];
}

export interface NavigationItemManifest {
  label: string;
  url: string;
  children?: NavigationItemManifest[];
}

export interface PageManifest {
  title: string;
  sections: SectionManifest[];
}

export interface SectionManifest {
  id: string;
  name: string;
  components: ComponentInstanceManifest[];
}

export interface ComponentInstanceManifest {
  id: string;
  type: string;
  properties: Record<string, any>;
}

export interface ComponentSchema {
  properties: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'object' | 'relation' | 'enum';
      required?: boolean;
      enumOptions?: string[];
    }
  >;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface CoreCartComponent {
  type: string;
  schema: ComponentSchema;
  validate(props: any): ValidationResult;
  render(props: any): React.ReactNode;
}

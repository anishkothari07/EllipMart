import { prisma } from '../prisma/client';
import { RuntimeManifest, ValidationResult } from './types';
import { componentRegistry } from './component-registry';
import { registerDefaultComponents } from './register-default-components';
import crypto from 'crypto';

export async function validateAndCompileManifest(websiteId: string): Promise<{
  validation: ValidationResult;
  manifest: RuntimeManifest | null;
}> {
  // Ensure default components are registered in context
  registerDefaultComponents();

  const errors: string[] = [];

  // 1. Fetch normalized website definition tables
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: {
      settings: true,
      aiConfig: true,
      themes: {
        where: { isActive: true },
        include: {
          tokens: true,
          layouts: {
            include: {
              pages: {
                include: {
                  routes: true,
                  sections: {
                    include: {
                      components: {
                        include: {
                          registry: true,
                          properties: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      navigations: {
        include: {
          menus: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      scripts: {
        where: { isActive: true },
      },
    },
  });

  if (!website) {
    return {
      validation: { valid: false, errors: ['Website registry entry not found.'] },
      manifest: null,
    };
  }

  // 2. Validate Settings
  const settings = website.settings;
  if (!settings) {
    errors.push('Settings missing: WebsiteSettings configuration is required.');
  } else if (!settings.logoUrl) {
    errors.push('Settings missing: Logo URL is required.');
  }

  // 3. Validate Theme & Expand Tokens
  const activeTheme = website.themes[0];
  if (!activeTheme) {
    errors.push('Theme missing: An active WebsiteTheme configuration is required.');
  }

  const tokens: Record<string, string> = {};
  if (activeTheme) {
    for (const t of activeTheme.tokens) {
      tokens[t.key] = t.value;
    }
  }

  // 4. Validate Pages, Layouts, Routes & Component Schemas
  const pages = activeTheme?.layouts.flatMap((l) => l.pages) || [];
  const homepage = pages.find((p) =>
    p.routes.some((r) => r.routePath === '/' || p.slug === 'home')
  );
  if (!homepage) {
    errors.push('Homepage missing: A page mapped to route path "/" or with slug "home" is required.');
  }

  // Check duplicate page routes
  const routePaths = new Set<string>();
  for (const page of pages) {
    for (const route of page.routes) {
      if (routePaths.has(route.routePath)) {
        errors.push(`Duplicate route path found: "${route.routePath}" is mapped to multiple pages.`);
      }
      routePaths.add(route.routePath);
    }
  }

  const manifestPages: Record<string, any> = {};
  for (const page of pages) {
    const pageRoute = page.slug === 'home' ? '/' : `/${page.slug}`;

    const manifestSections = page.sections
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => {
        const manifestComponents = s.components
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((c) => {
            const properties: Record<string, any> = {};
            for (const prop of c.properties) {
              const val = prop.literalValue;
              if (prop.schemaType === 'number') {
                properties[prop.key] = val !== null && val !== undefined ? Number(val) : null;
              } else if (prop.schemaType === 'boolean') {
                properties[prop.key] = val === 'true';
              } else {
                properties[prop.key] = val;
              }
            }

            const componentType = c.registry.name;
            const validation = componentRegistry.validate(componentType, properties);
            if (!validation.valid) {
              errors.push(`Page "${page.title}" section "${s.name}" component "${componentType}": ${validation.errors.join(', ')}`);
            }

            return {
              id: c.id,
              type: componentType,
              properties,
            };
          });

        return {
          id: s.id,
          name: s.name,
          components: manifestComponents,
        };
      });

    manifestPages[pageRoute] = {
      title: page.title,
      sections: manifestSections,
    };
  }

  // 5. Navigation Items
  const navigationManifest: Record<string, any> = {};
  for (const nav of website.navigations) {
    if (nav.type === 'MEGA_MENU') {
      const items = nav.menus
        .filter((m) => m.parentId === null)
        .map((m) => {
          const columns = nav.menus
            .filter((col) => col.parentId === m.id)
            .map((col) => {
              const links = nav.menus
                .filter((link) => link.parentId === col.id)
                .map((link) => ({ label: link.label, href: link.url }));
              return {
                title: col.label,
                links,
              };
            });
          return {
            label: m.label,
            href: m.url,
            columns,
          };
        });
      navigationManifest[nav.type] = items;
    } else {
      const items = nav.menus
        .filter((m) => m.parentId === null)
        .map((m) => {
          const children = nav.menus
            .filter((child) => child.parentId === m.id)
            .map((child) => ({ label: child.label, url: child.url }));
          return {
            label: m.label,
            url: m.url,
            children: children.length > 0 ? children : undefined,
          };
        });
      navigationManifest[nav.type] = items;
    }
  }

  // 6. Validate AI configurations
  const ai = website.aiConfig;
  if (!ai) {
    errors.push('AI Config missing: AIConfiguration registry entry is required.');
  }

  if (errors.length > 0) {
    return {
      validation: { valid: false, errors },
      manifest: null,
    };
  }

  // Generate Runtime Manifest JSON payload
  const manifest: RuntimeManifest = {
    websiteId: website.id,
    name: settings!.websiteName,
    host: website.domain,
    settings: {
      brandName: settings!.brandName,
      websiteName: settings!.websiteName,
      logoUrl: settings!.logoUrl || '/logo.png',
      faviconUrl: settings!.faviconUrl || '/favicon.ico',
      contactEmail: settings!.contactEmail || undefined,
      contactPhone: settings!.contactPhone || undefined,
      businessAddress: settings!.businessAddress || undefined,
      contactAddress: settings!.businessAddress || undefined,
      defaultCurrency: settings!.defaultCurrency,
      defaultLanguage: settings!.defaultLanguage,
      searchPlaceholder: settings!.searchPlaceholder,
      copyright: settings!.copyright || undefined,
      tagline: settings!.tagline || undefined,
      companyName: settings!.brandName || undefined,
      supportEmail: settings!.supportEmail || undefined,
      supportPhone: settings!.supportPhone || undefined,
      socialLinks: settings!.socialLinksJson ? JSON.parse(settings!.socialLinksJson) : {},
      paymentBadges: settings!.paymentBadgesJson ? JSON.parse(settings!.paymentBadgesJson) : [],
      announcements: settings!.announcementsJson ? JSON.parse(settings!.announcementsJson) : [],
      trendingSearches: settings!.trendingSearchesJson ? JSON.parse(settings!.trendingSearchesJson) : [],
      megaMenuFeatured: settings!.megaMenuFeaturedJson ? JSON.parse(settings!.megaMenuFeaturedJson) : undefined,
    },
    theme: {
      id: activeTheme!.id,
      name: activeTheme!.name,
      tokens,
    },
    navigation: navigationManifest,
    pages: manifestPages,
    seo: {
      title: settings!.websiteName,
      description: settings!.tagline || undefined,
    },
    ai: {
      assistantName: ai!.assistantName,
      avatarUrl: ai!.avatarUrl || undefined,
      greeting: ai!.greeting,
      suggestions: ai!.suggestionsJson ? JSON.parse(ai!.suggestionsJson) : [],
      prompt: ai!.prompt || undefined,
      model: ai!.model,
      temperature: ai!.temperature,
      tone: ai!.tone,
      enableSearch: ai!.enableSearch,
      enableCompare: ai!.enableCompare,
      enableRecommendations: ai!.enableRecommendations,
    },
    scripts: website.scripts.map((s) => ({
      placement: s.placement as 'HEAD' | 'BODY',
      code: s.code,
    })),
  };

  return {
    validation: { valid: true, errors: [] },
    manifest,
  };
}

export async function publishWebsite(websiteId: string): Promise<ValidationResult> {
  const result = await validateAndCompileManifest(websiteId);
  if (!result.validation.valid || !result.manifest) {
    return result.validation;
  }

  const payloadString = JSON.stringify(result.manifest);
  const hash = crypto.createHash('md5').update(payloadString).digest('hex');

  const versionsCount = await prisma.websiteVersion.count({
    where: { websiteId },
  });

  const nextVersion = versionsCount + 1;

  // Insert immutable version container
  const versionRecord = await prisma.websiteVersion.create({
    data: {
      websiteId,
      versionLabel: `v${nextVersion}`,
      payload: payloadString,
      hash,
      isLive: true,
    },
  });

  // Activate Version on Website
  await prisma.website.update({
    where: { id: websiteId },
    data: {
      activeVersionId: versionRecord.id,
    },
  });

  // Turn off isLive flag on all other versions
  await prisma.websiteVersion.updateMany({
    where: {
      websiteId,
      id: { not: versionRecord.id },
    },
    data: {
      isLive: false,
    },
  });

  return { valid: true, errors: [] };
}

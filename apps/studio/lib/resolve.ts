import { defineLocations } from 'sanity/presentation';
import type { PresentationPluginOptions } from 'sanity/presentation';

const section = (domain?: string) =>
  domain === 'farm' ? 'farm' : domain === 'pet' ? 'pets' : 'knowledge';

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    article: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
        language: 'language',
        primaryDomain: 'primaryDomain',
      },
      resolve: (doc) => ({
        locations:
          doc?.slug && doc?.language
            ? [
                {
                  title: doc.title ?? 'Material',
                  href: `/${doc.language}/${section(doc.primaryDomain)}/${doc.slug}/`,
                },
              ]
            : [],
      }),
    }),
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current', language: 'language' },
      resolve: (doc) => ({
        locations:
          doc?.slug && doc?.language
            ? [{ title: doc.title ?? 'Page', href: `/${doc.language}/${doc.slug}/` }]
            : [],
      }),
    }),
    siteSettings: defineLocations({
      message: 'Folosit pe toate paginile site-ului',
      tone: 'caution',
    }),
    author: defineLocations({
      message: 'Folosit în profil și în metadatele materialelor',
      tone: 'positive',
    }),
    species: defineLocations({ message: 'Folosit în metadatele materialelor', tone: 'positive' }),
    topic: defineLocations({ message: 'Folosit în metadatele materialelor', tone: 'positive' }),
    source: defineLocations({
      message: 'Folosit în guvernanța medicală a materialelor',
      tone: 'positive',
    }),
  },
};

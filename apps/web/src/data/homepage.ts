export interface SeasonalContent {
  title: string;
  summary: string;
  href: string;
}

export interface FeaturedCaseContent {
  title: string;
  summary: string;
  href: string;
}

// Content is intentionally absent until it has passed the applicable review workflow.
export const homepageContent: {
  seasonal?: SeasonalContent;
  featuredCase?: FeaturedCaseContent;
} = {};

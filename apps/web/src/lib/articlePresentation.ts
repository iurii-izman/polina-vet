import {
  deriveMedicalReviewState,
  derivePublicSafetyState,
  deriveSourceHealth,
  type PublicSafetyState,
} from './medical.ts';

const SAFE_DESCRIPTION =
  'Этот материал временно недоступен. Откройте безопасный актуальный маршрут.';

export interface ArticlePresentation {
  safetyState: PublicSafetyState;
  description: string;
  robots?: 'noindex,follow';
  showMedicalContent: boolean;
}

export function getArticlePresentation(
  article: {
    medicalOwner?: unknown;
    reviewedBy?: unknown;
    riskLevel?: 'HIGH' | 'STANDARD' | 'LOW';
    withdrawn?: boolean;
    lastMedicalReview?: string;
    reviewIntervalMonths?: number;
    sources?: Array<{ status?: string } | null | undefined>;
    summary?: string | null;
    seoDescription?: string | null;
  },
  now: string,
): ArticlePresentation {
  const governanceValid =
    Boolean(article.medicalOwner) && (article.riskLevel !== 'HIGH' || Boolean(article.reviewedBy));
  const safetyState = derivePublicSafetyState({
    riskLevel: article.riskLevel,
    withdrawn: article.withdrawn,
    reviewState: deriveMedicalReviewState(article, now),
    sourceHealth: deriveSourceHealth(article.sources ?? []),
    governanceValid,
  });
  const showMedicalContent = safetyState === 'CURRENT';
  return {
    safetyState,
    description: showMedicalContent
      ? (article.seoDescription ?? article.summary ?? SAFE_DESCRIPTION)
      : SAFE_DESCRIPTION,
    robots: showMedicalContent ? undefined : 'noindex,follow',
    showMedicalContent,
  };
}

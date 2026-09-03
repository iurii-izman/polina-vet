import {
  deriveMedicalReviewState,
  derivePublicSafetyState,
  deriveSourceHealth,
  type PublicSafetyState,
} from './medical.ts';

const VALID_DOMAINS = new Set(['pet', 'farm', 'shared']);
const VALID_RISK_LEVELS = new Set(['HIGH', 'STANDARD', 'LOW']);

const resolvedIdentity = (value: unknown) => {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as { _id?: unknown; _ref?: unknown };
  return item._id ?? item._ref;
};

export function hasValidPublicationContract(article: {
  title?: string | null;
  summary?: string | null;
  primaryDomain?: string;
  medicalOwner?: unknown;
  reviewedBy?: unknown;
  riskLevel?: string;
  medicalRevision?: number;
  lastMedicalReview?: string;
  reviewIntervalMonths?: number;
  sources?: Array<unknown> | null;
  body?: Array<unknown> | null;
}): boolean {
  const meaningful = (value: unknown) =>
    typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  const reviewDate = article.lastMedicalReview;
  return (
    meaningful(article.title) &&
    meaningful(article.summary) &&
    VALID_DOMAINS.has(article.primaryDomain ?? '') &&
    Boolean(article.medicalOwner) &&
    VALID_RISK_LEVELS.has(article.riskLevel ?? '') &&
    Number.isInteger(article.medicalRevision) &&
    (article.medicalRevision ?? 0) >= 1 &&
    Boolean(reviewDate && /^\d{4}-\d{2}-\d{2}$/.test(reviewDate)) &&
    Number.isInteger(article.reviewIntervalMonths) &&
    (article.reviewIntervalMonths ?? 0) >= 1 &&
    Boolean(article.sources?.length) &&
    article.sources?.every(Boolean) === true &&
    Boolean(article.body?.length) &&
    (article.riskLevel !== 'HIGH' ||
      (Boolean(article.reviewedBy) &&
        resolvedIdentity(article.reviewedBy) !== resolvedIdentity(article.medicalOwner)))
  );
}

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
    medicalRevision?: number;
    withdrawn?: boolean;
    lastMedicalReview?: string;
    reviewIntervalMonths?: number;
    sources?: Array<{ status?: string } | null | undefined>;
    summary?: string | null;
    seoDescription?: string | null;
    primaryDomain?: string;
    body?: Array<unknown> | null;
  },
  now: string,
): ArticlePresentation {
  const governanceValid = hasValidPublicationContract(article);
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

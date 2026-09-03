export const syntheticMedicalFixtures = {
  currentStandardPet: {
    id: 'fixture-current-standard',
    language: 'ru',
    primaryDomain: 'pet',
    body: [
      {
        _type: 'practicalActions',
        _key: 'a',
        title: 'Synthetic actions',
        items: ['Test action A'],
      },
    ],
  },
  staleHigh: {
    id: 'fixture-stale-high',
    language: 'ru',
    primaryDomain: 'farm',
    riskLevel: 'HIGH',
    body: [
      {
        _type: 'safetyNotice',
        _key: 'a',
        title: 'Synthetic notice',
        text: 'Synthetic fixture only.',
      },
    ],
  },
  withdrawnSource: {
    id: 'fixture-withdrawn-source',
    sources: [{ id: 'fixture-source-withdrawn', status: 'withdrawn' }],
  },
  withdrawnWithReplacement: {
    id: 'fixture-withdrawn',
    withdrawn: true,
    replacement: 'fixture-current-standard',
  },
  currentTranslation: {
    id: 'fixture-current-translation',
    language: 'ro',
    translatedFromMedicalRevision: 3,
    sourceMedicalRevision: 3,
  },
  staleTranslation: {
    id: 'fixture-stale-translation',
    language: 'ro',
    translatedFromMedicalRevision: 2,
    sourceMedicalRevision: 3,
  },
  missingTranslation: { id: 'fixture-missing-translation', language: 'ro' },
} as const;

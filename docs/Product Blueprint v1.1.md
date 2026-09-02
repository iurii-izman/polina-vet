# POLINA VET
## Product Blueprint v1.1 — Architecture Freeze Patch

**Основа:** Product Blueprint v1.0  
**Тип обновления:** точечная архитектурная коррекция  
**Статус после принятия:** READY FOR HIGH-FIDELITY PROTOTYPE

---

# 1. Product Definition — без изменений

POLINA VET остаётся:

> **Veterinary Guidance & Routing Hub** — практическим мультиязычным ветеринарным ресурсом, который помогает владельцу домашнего или сельскохозяйственного животного понять ситуацию, выбрать следующий безопасный шаг, подготовиться к обращению и получить профессионально подготовленную информацию.

Не меняются:

- task-first;
- Pets / Farm как разные вертикали;
- Polina as trust layer;
- structured knowledge;
- static-first Astro;
- Sanity;
- commercial layer OFF by default;
- Modern Local / Field Medicine.

---

# 2. Urgent Architecture — ИЗМЕНЕНО

## Было

```text
/urgent/
/pets/urgent-signs/
/farm/urgent-signs/
```

Это создавало три потенциальных источника срочных рекомендаций.

## Стало

```text
/urgent/
   ↓
   ├── Домашнее животное → /pets/urgent/
   └── Сельскохозяйственное животное → /farm/urgent/
```

### `/urgent/`

Это **не medical article**.

Это короткий safety-router:

```text
Ситуация кажется срочной?

[Домашнее животное]
[Сельскохозяйственное животное]

Этот сайт не является круглосуточной
экстренной ветеринарной службой.
```

### `/pets/urgent/`

Pet-specific red flags + safe next actions.

### `/farm/urgent/`

Farm-specific red flags, включая:

- одно животное;
- несколько животных одновременно;
- reproductive emergency;
- recumbency;
- severe respiratory distress;
- major trauma;
- возможный group/herd risk;
- biosecurity considerations.

---

# 3. Urgent Safety Rule

Нельзя создавать бинарный:

```text
RED / GREEN
```

где GREEN воспринимается как:

> можно не обращаться.

Обязательная формулировочная логика:

> Перечисленные признаки требуют срочного действия. Их отсутствие не исключает серьёзное состояние.

---

# 4. Availability Boundary — НОВОЕ

Urgent content и доступность Полины являются разными сущностями.

На urgent pages:

```text
Срочные признаки
↓
Что безопасно сделать сейчас
↓
Как получить ветеринарную помощь
↓
Контакты и доступность Полины
```

Не:

```text
Срочно → Позвонить Полине
```

без operational disclaimer.

Обязательный принцип:

> Не ждите ответа в мессенджере, если состояние животного быстро ухудшается или присутствуют признаки, требующие срочной ветеринарной помощи.

Финальная формулировка зависит от реально доступной помощи в регионе.

---

# 5. Translation Family — НОВОЕ, ОБЯЗАТЕЛЬНО

Каждая multilingual content entity относится к стабильной translation family.

## Medical article

```text
translationGroupId
language

translatedFrom
medicalRevision
sourceMedicalRevision
```

### Example

RU:

```text
translationGroupId = "parvo-dogs"
language = "ru"
medicalRevision = 7
```

RO:

```text
translationGroupId = "parvo-dogs"
language = "ro"
translatedFrom = RU_REFERENCE
sourceMedicalRevision = 6
```

System derives:

```text
RO.translationState = REVIEW_REQUIRED
```

---

# 6. Sanity `_rev` НЕ используется как medical revision

Sanity document revision может меняться при:

- исправлении опечатки;
- SEO update;
- смене фотографии;
- formatting change.

Поэтому добавляется отдельное:

```text
medicalRevision: integer
```

Увеличивается только при **медицински значимом изменении**.

---

# 7. Translation States — ВЫЧИСЛЯЕМЫЕ

Не хранить вручную всё, что можно вычислить.

## Stored facts

```text
language
translationGroupId
translatedFrom
medicalRevision
sourceMedicalRevision
withdrawn
```

## Derived state

```text
CURRENT
REVIEW_REQUIRED
PENDING
WITHDRAWN
```

---

# 8. Primary Domain — НОВОЕ

Каждая long-form medical entity имеет одного product owner domain:

```text
primaryDomain:
  pet
  farm
  shared
```

Это не то же самое, что:

```text
audiences[]
species[]
topics[]
```

## Purpose

`primaryDomain` определяет:

- canonical route;
- template;
- CTA;
- related content behavior;
- tone;
- breadcrumbs.

---

# 9. Canonical Content Rule

Нельзя создавать два почти одинаковых материала:

```text
/pets/wounds/
/farm/wounds/
```

если медицинское ядро одно и то же.

Вместо этого:

```text
primaryDomain = shared
```

с context-specific modules:

```text
Pet considerations
Farm considerations
```

или создаётся один действительно domain-specific материал, если контекст существенно различается.

---

# 10. Reviewer Governance — УПРОЩЕНО

## Было

Каждый medical document обязан иметь:

```text
author
reviewer
```

## Стало

Каждый medical document обязан иметь:

```text
medicalOwner
riskLevel
lastMedicalReview
reviewInterval
sources[]
medicalRevision
```

Optional:

```text
reviewedBy
reviewNotes
```

---

# 11. Independent Reviewer Required Only When

```text
riskLevel = HIGH
```

или редакционная политика явно требует дополнительной проверки.

Примеры:

- urgent safety guidance;
- high-risk treatment-related claim;
- спорная рекомендация;
- узкоспециализированный материал;
- материал вне основной области компетенции автора.

Для обычного owner/farm explainer независимый reviewer не является искусственным обязательным барьером публикации.

---

# 12. Risk Model — НОВОЕ

```text
riskLevel:
  HIGH
  STANDARD
  LOW
```

## HIGH

Например:

- urgent;
- poisoning;
- first aid;
- потенциально опасные действия;
- quickly changing guidance.

Review target:

```text
3–6 months
```

или немедленно при значимом изменении источника.

## STANDARD

Большинство clinical/prevention материалов.

```text
12 months
```

## LOW

Стабильная базовая информация.

```text
18–24 months
```

---

# 13. Review States — DERIVED

## Stored

```text
lastMedicalReview
reviewInterval
archived
withdrawn
```

## Derived

```text
CURRENT
REVIEW_DUE
OVERDUE
ARCHIVED
WITHDRAWN
```

CMS не заставляет Полину вручную синхронизировать:

```text
status = CURRENT
```

и дату, которая говорит обратное.

---

# 14. Public vs Internal Review State

### Internal Studio

Полина видит:

```text
CURRENT
REVIEW DUE
OVERDUE
```

### Public

По умолчанию показывается:

```text
Последняя медицинская проверка: DATE
```

Не показываем пользователю технический:

> OVERDUE

как newsroom badge.

---

# 15. Stale High-Risk Content — ИЗМЕНЕНО

High-risk material, утративший актуальность:

### Не должен

- продолжать отображать старую медицинскую инструкцию;
- превращаться в 404 dead end.

### Должен

```text
old URL
↓
safe replacement / current urgent route
```

и удаляться из:

- navigation;
- search;
- featured blocks.

При наличии подходящей замены:

```text
301 → replacement
```

При временном снятии без прямого эквивалента:

показывается safety replacement page с переходом на текущий urgent guidance.

---

# 16. Source Lifecycle — УСИЛЕНО

`source` получает:

```text
status:
  current
  superseded
  withdrawn
```

Optional:

```text
supersededBy
jurisdiction
doi
identifier
```

Это позволит через несколько лет понимать:

> guideline всё ещё действующий или уже заменён?

---

# 17. Clinical Case Privacy — УСИЛЕНО

В Sanity НЕ хранится реальное согласие владельца.

Sanity содержит только:

```text
consentVerified: boolean
consentReference: internalIdentifier
anonymisationVerified: boolean
```

Сам consent artifact хранится вне публичной CMS.

---

# 18. Clinical Case Anonymisation Checklist

Проверять:

- имя владельца;
- телефон;
- адрес;
- лицо;
- номер автомобиля;
- номер дома;
- название хозяйства;
- GPS / EXIF;
- номер пациента;
- документы в кадре;
- необычный фон;
- другие данные, позволяющие идентификацию.

---

# 19. Multilingual MVP — СОКРАЩЕНО

## RU

Полный launch corpus.

## RO / UK

Launch parity только для **core journeys**.

Обязательно:

```text
Homepage
Pets
Farm
Urgent gateway
Pet urgent
Farm urgent
About summary
Contact
Before visit
Before vet arrives
Privacy/legal minimum
```

Не требуется на launch:

> 6–10 medical articles на каждый язык.

Они добавляются постепенно после запуска translation workflow.

---

# 20. Missing Translation — SEO Rule

Если перевода статьи нет:

НЕ создаётся индексируемая:

```text
/ro/article/
```

со страницей-заглушкой.

Language switcher показывает:

```text
Română
Перевод пока отсутствует
```

И предлагает:

```text
Открыть русскую версию
```

Это UI state, не отдельная indexable content page.

---

# 21. Canonical / hreflang Rule

Каждая реально опубликованная language page:

- имеет self-canonical;
- содержит только реально существующие alternates;
- имеет reciprocal hreflang links.

Пример:

```text
RU ↔ RO
```

Если UK отсутствует:

UK hreflang не генерируется.

---

# 22. Slug Lifecycle — НОВОЕ

Published slug считается стабильным.

Если slug меняется:

```text
previousSlugs[]
```

или центральный redirect registry сохраняет историю.

Production генерирует:

```text
OLD URL → 301 → CURRENT URL
```

Это проектируется до запуска, а не после первых broken backlinks.

---

# 23. Taxonomy Localization — УТОЧНЕНО

## Sanity field-level localization

Для:

```text
species.name
species.synonyms
topic.name
topic.synonyms
```

Например:

```text
name.ru
name.ro
name.uk
```

---

# 24. UI Microcopy НЕ хранится в Sanity

Например:

```text
Назад
Поиск
Срочно
Читать
Открыть русскую версию
```

хранится в frontend i18n dictionaries.

Sanity не превращается в translation management system интерфейсных кнопок.

---

# 25. SEO Editing — УПРОЩЕНО

По умолчанию:

```text
document.title → SEO title
document.summary → meta description
heroImage → OG image
```

Sanity предлагает optional override:

```text
seoTitle
seoDescription
ogImageOverride
```

Полина не обязана писать SEO metadata вручную.

---

# 26. Feature Flags — СОКРАЩЕНЫ

Не создаём flags для систем, которых не существует.

## MVP

Например:

```text
showSeasonalPanel
showClinicalCases
showContactForm
showSearch
```

---

## Future capability

Когда реально появляется booking:

вместе создаются:

- data model;
- routes;
- UX;
- legal state;
- integrations;
- analytics;
- capability switch.

Не добавляем сегодня:

```text
paymentsEnabled
shopEnabled
```

ради иллюзии future-proofing.

---

# 27. Commercial Safety

Коммерчески чувствительные функции дополнительно управляются deployment/environment configuration.

CMS-флаг не считается единственным security/legal boundary.

---

# 28. Production / Preview Architecture — ЗАФИКСИРОВАНО

## Production

```text
Astro
static-first
prerendered public pages
```

Publishing:

```text
Sanity publish
↓
webhook
↓
Astro build
↓
validation
↓
deploy
```

Для текущего масштаба — full rebuild.

---

## Preview

Отдельное preview environment:

```text
Astro output = server
+
Sanity draft perspective
+
Presentation Tool
+
Visual Editing
```

Использует те же presentation components, что production.

Preview:

- noindex;
- access-controlled where appropriate;
- не является production runtime.

---

# 29. Static-first Boundary

Static остаётся правильным для:

- articles;
- farm guides;
- pet guides;
- clinical cases;
- policies;
- seasonal guidance;
- about;
- contact information.

Dynamic/server architecture рассматривается позже только для реально появившихся функций:

- live availability;
- booking;
- accounts;
- realtime alerts;
- personalized tools.

Это НЕ причина менять Astro.

---

# 30. CI Philosophy — УПРОЩЕНА

## Hard build failure

Только если проблема может выпустить реально сломанный или опасный продукт:

```text
invalid build
route collision
broken required reference
invalid translation relation
HIGH-risk published content without required minimum governance
```

---

## Warning / Studio dashboard

```text
review due
overdue standard article
old source
missing SEO override
translation missing
translation review due
```

Не превращаем CI в редакционный отдел.

---

# 31. Sanity Validation First

Большинство editorial ошибок ловится:

```text
в Sanity Studio
до Publish
```

через:

- field validation;
- document validation;
- conditional requirements;
- custom document actions при необходимости.

---

# 32. Sanity Studio MVP — УПРОЩЕНО

Не newsroom OS.

Navigation:

```text
МАТЕРИАЛЫ
  Articles
  Clinical Cases

ТРЕБУЕТ ВНИМАНИЯ
  Review Due
  High Risk
  Translations

СПРАВОЧНИК
  Species
  Topics
  Sources
  Authors

САЙТ
  Pages
  Navigation
  Contacts
  Settings
```

Максимум.

---

# 33. Page Builder — СОКРАЩЁН

MVP реализует только реально используемые блоки:

```text
hero
gatewayGrid
richText
quickActions
trustBlock
articleGrid
seasonalPanel
caseFeature
contactBlock
```

Не создаём универсальный no-code конструктор сайта.

---

# 34. `downloadableResource` — DEFER

Убирается из core MVP schema.

Главная стратегия:

```text
canonical web page
+
print stylesheet
```

Отдельный downloadable resource появляется только если реальная потребность подтверждается.

---

# 35. Search — CONDITIONAL MVP

Если на launch:

```text
< ~20 meaningful knowledge pages
```

полноценный search можно отложить до V1.5.

Навигация должна работать без поиска.

---

# 36. Search Architecture всё равно future-ready

Article хранит:

```text
title
summary
species
topics
synonyms
```

Поэтому search можно подключить позже без миграции контента.

---

# 37. MVP Size — СОКРАЩЁН

Не фиксируем 27–32 RU indexable pages как launch requirement.

## Target

Ориентировочно:

### 14–18 meaningful RU content/pages

плюс необходимые legal/system pages.

---

# 38. Core MVP Content

```text
Home

Pets
Farm

Urgent Gateway
Pet Urgent
Farm Urgent

Before Visit
Before Vet Arrives

Vaccination / Prevention
Parasites

2–4 high-value pet guides

2–3 high-value farm guides

About Polina
Contact

Editorial / Medical policy
Privacy / Disclaimer
```

---

# 39. Clinical Cases at Launch

Не требуются три.

Target:

```text
0–1 exceptional case
```

Если нет случая, который действительно соответствует quality/privacy bar:

раздел не показывается.

**Никаких пустых разделов.**

---

# 40. Seasonal Alerts at Launch

`SeasonalAlert` остаётся отдельным document type только если действительно нужен структурированный:

```text
validFrom
validUntil
source
severity
region
```

Если на запуске «Актуально сейчас» является просто curated seasonal guidance, можно использовать Article + promotion metadata.

Final choice принимается при content inventory freeze.

---

# 41. Primary Homepage Quick Actions — ИСПРАВЛЕНО

Не смешивать:

- task;
- audience;
- taxonomy.

Пример:

```text
Животное заболело

Профилактика

Подготовиться к обращению

Что делать срочно

Найти полезный материал
```

Не:

> Материалы для фермеров

потому что Farmer уже primary gateway.

---

# 42. Schema `article` v1.1

Минимальное ядро:

```text
title
slug
language

translationGroupId
translatedFrom

primaryDomain

summary
content

audiences[]
species[]
topics[]

medicalOwner
riskLevel

medicalRevision
sourceMedicalRevision

lastMedicalReview
reviewInterval

reviewedBy?
reviewNotes?

sources[]

archived
withdrawn

seoOverrides?

previousSlugs[]
```

---

# 43. Derived Article Properties

Не храним как ручные истины:

```text
nextReviewDue
reviewState
translationState
canonicalUrl
alternateLocales
```

Вычисляются из stored facts.

---

# 44. `clinicalCase` v1.1

```text
title
slug
language

translationGroupId

primaryDomain
species

patientContext
presentation
history

initialAssessment
differentialConsiderations
diagnosticsAvailable

decisionRationale
treatment
dynamics
outcome

lessons
limitations

medicalOwner
riskLevel
medicalRevision

sources[]

consentVerified
consentReference
anonymisationVerified

images[]

lastMedicalReview
reviewInterval
```

---

# 45. `source` v1.1

```text
title
organization
authors

sourceType

url
publicationDate
version

jurisdiction

status
supersededBy

doi
identifier

accessedAt
notes
```

---

# 46. Species / Topic v1.1

```text
name:
  ru
  ro
  uk

synonyms:
  ru[]
  ro[]
  uk[]

sortOrder
```

Species дополнительно:

```text
group:
  pet
  farm
  working
  other
```

---

# 47. Author Architecture — KEEP

`author` остаётся отдельной entity.

Не создавать систему, где:

```text
author = Polina hardcoded forever
```

Это позволит позже:

```text
publisher = POLINA VET
medicalDirector = Polina
authors = Polina + colleagues
```

без миграции архитектуры.

---

# 48. Product Metrics — KEEP

North Star:

# Useful Next Step Rate

Оставляется без изменений.

Это сильнее:

- pageviews;
- article count;
- time-on-site;
- social followers.

---

# 49. Product Constitution v1.1

```text
Task before biography.

Pets and Farm are separate product verticals.

Urgent routing is not an emergency-service promise.

Global urgent is a gateway, not duplicate medical content.

Every content entity has one canonical product domain.

Medical change has its own revision number.

Translation lineage is explicit.

Translation freshness follows medical revision,
not ordinary document revision.

Store facts; derive states.

Governance must be strong enough to protect quality
and simple enough that one doctor will actually use it.

Independent medical review is risk-based,
not ceremonial.

Missing translation is explicit
and never becomes an indexable fake page.

Public production is static-first.

Preview is server-rendered and draft-aware.

Sanity owns structured content,
not every interface label.

The CMS should remove work from the doctor,
not manufacture work.

No feature ships merely because the architecture
could support it.

Small and correct remains more valuable
than large and theoretically complete.
```

---

# 50. Final Architecture Verdict

После внесения v1.1:

### Product model

**FROZEN**

### Pets/Farm model

**FROZEN**

### Urgent model

**FROZEN**

### Astro + Sanity

**FROZEN**

### Localization architecture

**FROZEN at structural level**

### Sanity schema

**READY FOR PROTOTYPE; final field naming can still change during implementation**

### MVP content count

**Reduced / realistic**

### Commercial layer

**OFF**

### Visual direction

**Modern Local / Field Medicine**

### Next phase

# HIGH-FIDELITY PRODUCT PROTOTYPE
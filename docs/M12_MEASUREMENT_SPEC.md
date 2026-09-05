# M12 measurement specification

North Star: Useful Next Step Rate = sessions with at least one meaningful next step / measured sessions. Meaningful steps are domain selection, urgent guidance entry, relevant knowledge opening, preparation route, contact channel opening, map opening, or a relevant next resource. A raw click is not automatically a conversion.

Primary outcomes: `useful_next_step`, `contact_click`, `map_open`, `urgent_open`.

Secondary engagement: `domain_select`, `knowledge_open`, `language_switch`.

Diagnostic: `outbound_social`.

Vocabulary is deliberately eight events. Properties are controlled: `channel` (telegram, viber, phone, instagram, facebook, whatsapp), `domain` (pet, farm, shared), `locale` (ru, ro, uk), `surface` (home, contact, header, footer, article, urgent), `kind` (domain, urgent, knowledge, preparation, contact, map), and language `from`/`to`.

The implementation is `apps/web/src/lib/analytics.ts` plus the passive browser adapter. Collection requires the independent explicit gate `PUBLIC_ANALYTICS_ENABLED=true`, `PUBLIC_PLAUSIBLE_DOMAIN`, and `DEPLOYMENT_TARGET=production`; `SITE_INDEXABLE` does not participate. Non-production is disabled, and no PII, full URL, query string, fragment, or referrer is accepted by the allowlist.

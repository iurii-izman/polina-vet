# M12 campaign standard

Required fields: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. Use `utm_term` only for meaningful non-personal search terms.

Sources: telegram, viber, instagram, facebook, whatsapp, google, qr, offline, partner. Mediums: social, messenger, organic, paid-search, paid-social, qr, print, referral. Campaign and content codes describe the asset or initiative, never a person, phone number, client, condition, or identity.

Build a link with `pnpm growth:link --destination /ru/pets/ --source telegram --medium messenger --campaign prevention-2026 --content bio`. The base is `SITE_URL`, so changing to `lina.vet` requires configuration only. Permanent QR generation waits for R1 domain activation.

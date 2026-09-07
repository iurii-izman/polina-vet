# Future Architecture Guardrails

This document records durable constraints for future milestones. It is not a roadmap and does not authorize building any new capability during the M14.5 development pause. The private operations foundation exists because it was explicitly required by M13/M14; it does not authorize expanding it.

## Public editorial CMS is not a private operational system

The Sanity production dataset is for public editorial knowledge: authors, sources, approved public cases/content, and public-facing metadata. It must not become the primary store for private client profiles, phone or email conversation histories, patient medical records, farm operational records, private intake data, internal tasks, payments, or private CRM activity.

Public content consent and anonymisation rules remain separate from private operational data controls.

## Operational boundary after M14.5

Clients, animals, holdings, encounters, inquiries, cases, tasks, and communication events belong only in the isolated private operations plane when a concrete approved workflow requires them. Do not add private entities to Sanity or the public Astro data path. Keep production Intake disabled until the current R3 external gates are complete.

Prefer stable IDs and explicit relationships. Do not couple integrations or consequential workflows to display names or mutable slugs.

## Provenance, privacy, and auditability

Automation- or AI-produced data must preserve its origin and source when that provenance is consequential. Private client or patient data requires explicit data boundaries, access control, and a clearly owned system of record.

Consequential automated actions must later be attributable by who or what performed them, when they occurred, and which source or input supported the action. Public content must remain appropriately consented and anonymised.

## AI boundary and human control

AI may later assist with drafting, structuring, summarisation, classification, routing suggestions, and administrative workflows. It must not autonomously diagnose, prescribe, publish high-risk medical content, make consequential client-facing medical decisions, or bypass human review. Human approval remains required for clinically consequential actions.

The strategic boundary is: maximize automation around the professional veterinary decision while keeping clinically significant decisions human-controlled.

## Avoid premature infrastructure

Do not add a CRM, n8n, agent swarm, knowledge graph, vector database, client portal, telephony, workflow engine, second notification channel, or second operational database until a concrete post-pause milestone requires one and defines its data boundary, access control, provenance, auditability, retention, and human-review behavior.

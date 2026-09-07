# M14.5 Architecture

The existing M14 audit trail remains accountability history. It is not repurposed as telemetry.

```text
Access-authenticated Office browser
        -> Office Worker
             -> Operations D1 (clinical truth + audit)
             -> Cloudflare Workers Logs / Traces
             -> Analytics Engine learning dataset
        scheduled Worker
             -> aggregate-only D1 queries
             -> Analytics Engine daily snapshot events
```

## Boundaries

- Technical logs contain controlled route classes, operations, status, safe error codes, request IDs, release, and duration only.
- Product telemetry contains schema-v1 controlled dimensions and numeric slots only; it never contains request IDs or entity IDs.
- Analytics Engine is physically separated by environment: `polina_vet_learning_staging` and `polina_vet_learning_production`.
- Snapshot failure is isolated from retention and other scheduled work.
- Production configuration is prepared but production clinical processing remains inactive.

## Release identity

The Worker uses Cloudflare Version Metadata (`VERSION_METADATA.id`, then tag) when available. An explicit `RELEASE` value may override it for controlled local/test execution; no deploy-time hardcoded SHA is required.

# POLINA VET — Codex Tooling Setup on Windows

Project path:
`C:\Dev\polina-vet`

## Recommended initial tools

Use only:
1. Codex
2. Context7
3. Sanity official MCP / Agent Toolkit
4. Chrome DevTools MCP
5. Git + GitHub CLI
6. pnpm / Node
7. Playwright + axe + Lighthouse CI as project dependencies later

Figma MCP is intentionally deferred unless the project adopts Figma as an additional source of truth.

## GitHub

Recommended initial repository visibility: **private**.

If GitHub CLI is installed and authenticated:

```powershell
cd C:\Dev\polina-vet
git init
git branch -M main
gh auth status
gh repo create polina-vet --private --source . --remote origin
```

Do not push secrets or `.env` files.

## Context7

Keep exactly one working Context7 integration for the project. Prefer the currently supported Codex plugin/app flow, avoid duplicate plugin and MCP instances, and verify the active integration in the Codex tooling UI or MCP list. Do not add a second Context7 marketplace or configure duplicate servers.

Alternative MCP configuration is available from Context7 documentation.

## Sanity MCP

Sanity provides the hosted MCP endpoint:

`https://mcp.sanity.io`

The Sanity CLI can configure supported AI clients, including Codex CLI:

```powershell
pnpm dlx sanity@latest mcp configure
```

Prefer OAuth/CLI-auth flows over hardcoding tokens into repository files.

## Chrome DevTools MCP

Windows-friendly Codex configuration:

```powershell
codex mcp add chrome-devtools -- cmd /c npx -y chrome-devtools-mcp@1.8.0
```

If startup is unreliable, use a local/user `~/.codex/config.toml` entry with `cmd`, Windows environment variables, and a longer startup timeout. Do not commit user-specific Windows paths or secrets to the repository.

## Verify

```powershell
codex mcp list
```

Confirm that the intended tools are available before asking Codex to rely on them. The repository example is pinned to the locally verified `chrome-devtools-mcp` version `1.8.0`; do not change user-level configuration automatically.

## Browser tooling roles

- The official Playwright Codex skill is for exploratory browser automation and agent-driven QA.
- Project `@playwright/test` is for deterministic regression tests in CI.
- Chrome DevTools MCP is for interactive inspection, debugging, performance, and accessibility checks.

Do not install a second browser MCP, and do not replace Playwright tests with the exploratory skill.

## Important

Do not install multiple overlapping browser MCPs.
Playwright remains the automated regression tool; Chrome DevTools MCP is for interactive inspection/debugging.

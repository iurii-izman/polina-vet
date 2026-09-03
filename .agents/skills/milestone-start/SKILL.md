---
name: milestone-start
description: Use before starting a milestone, feature branch, large implementation task, or prerequisite-dependent work.
---

# Milestone Start

Use this startup checklist before milestone-sized or prerequisite-dependent work.

## Establish a safe baseline

Inspect the worktree and ancestry before changing files:

```text
git status --porcelain
git fetch origin
git branch --show-current
git log -8 --oneline --decorate
```

Identify the required previous milestone or PR and confirm it is merged when required. Confirm that `origin/main` contains its commit; never infer this from a branch name alone.

Protect user work:

- If tracked local changes exist, stop and report them or preserve them safely before proceeding.
- Do not use `git reset --hard`.
- Do not overwrite, delete, or automatically stage unrelated untracked files.
- The expected local `output/` directory must remain untracked when present.

When the baseline is safe, update it with `git checkout main` and `git pull --ff-only`, then create the feature branch from the current `origin/main`.

Verify the branch:

```text
git merge-base HEAD origin/main
git rev-list --left-right --count HEAD...origin/main
```

Record the base SHA, branch name, and ahead/behind counts in the task notes or final report.

If the task affects Sanity production content or schemas, inspect the current project/dataset state before any mutation and follow `sanity-change`. Do not mutate production data as part of establishing a baseline.

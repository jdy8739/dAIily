# Git Commit Guide

## Commit Rules

When committing changes:

1. **Review all local changes**: Run `git status` and `git diff` to see
   everything that changed
2. **Divide commits by logical flow**: Group related changes together
3. **Commit step-by-step by files**: Make separate commits for different
   files/features
4. **NO single large commits**: Break up changes into small, focused
   commits
5. **Each commit should represent one logical unit of work**

## Commit Message Format

:

Types

- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

Example Workflow

# Instead of one commit with all changes:

git add file1.ts && git commit -m "feat: add user model"
git add file2.ts && git commit -m "feat: add user controller"
git add file3.ts && git commit -m "test: add user tests"

Guidelines

- Keep the summary line under 50 characters
- Use imperative mood ("add" not "added")
- Explain the "why" not the "what" in the description

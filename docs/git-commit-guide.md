# Git Commit Guide

## Commit Rules

When committing changes:

1. **Review all local changes**: Run `git status` and `git diff` to see everything that changed
2. **Group by feature/interest**: Combine related changes into meaningful commits
3. **Not too micro**: Don't commit file-by-file - group related files that serve the same feature
4. **Not too large**: Don't bundle unrelated changes together
5. **Each commit = one logical feature or fix**

## Commit Grouping Guidelines

**Good grouping examples:**

- `feat: add user story viewing` - includes API endpoints, components, and page changes for one feature
- `fix: goals API issues` - combines schema fix + route fix for related bug
- `docs: add commit guidelines` - standalone documentation change

**Bad grouping examples:**

- ❌ Too micro: separate commits for each file in same feature
- ❌ Too large: combining multiple unrelated features in one commit

## Commit Message Format

```
<type>: <short summary>

<optional detailed description>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Example

```
feat: add user authentication

Implemented JWT-based authentication with login and logout endpoints.
Added middleware for protecting routes.
```

## Guidelines

- Keep the summary line under 50 characters
- Use imperative mood ("add" not "added")
- Explain the "why" not the "what" in the description
- Group related changes by feature interest, not by file

# Git Workflow Guide

## Branch Strategy

We follow a **Git Flow** inspired workflow with the following main branches:

### Main Branches

- **`main`** - Production-ready code. Deployments to production happen from this branch.
- **`dev`** - Integration branch for features. Pre-production testing happens here.

### Supporting Branches

- **`feature/*`** - New features or enhancements
- **`bugfix/*`** - Bug fixes for dev branch
- **`hotfix/*`** - Urgent fixes for production
- **`release/*`** - Release preparation

## Workflow Steps

### 1. Starting a New Feature

```bash
# Make sure you're on the latest dev branch
git checkout dev
git pull origin dev

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Working on Your Feature

```bash
# Make changes and commit frequently
git add .
git commit -m "feat: add new feature description"

# Keep your branch updated with dev
git fetch origin
git rebase origin/dev
```

### 3. Submitting Your Work

```bash
# Push your branch to remote
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
# Target: dev branch
# Add descriptive title and description
# Request review from team members
```

### 4. After PR is Approved

```bash
# Merge using GitHub UI (Squash and Merge recommended)
# Delete the feature branch after merge
```

### 5. Creating a Release

```bash
# From dev branch, create release branch
git checkout dev
git pull origin dev
git checkout -b release/v1.2.0

# Make version updates, changelog, etc.
git commit -m "chore: prepare release v1.2.0"

# Merge to main
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# Merge back to dev
git checkout dev
git merge release/v1.2.0
git push origin dev

# Delete release branch
git branch -d release/v1.2.0
```

### 6. Hotfixes

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Make the fix
git commit -m "fix: resolve critical bug"

# Merge to main
git checkout main
git merge hotfix/critical-bug-fix
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin main --tags

# Merge to dev
git checkout dev
git merge hotfix/critical-bug-fix
git push origin dev

# Delete hotfix branch
git branch -d hotfix/critical-bug-fix
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks
- **perf:** Performance improvements

### Examples

```bash
git commit -m "feat: add user authentication module"
git commit -m "fix: resolve login timeout issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify chat gateway logic"
```

## Pull Request Guidelines

### PR Title Format

```
<type>: <short description>
```

Examples:
- `feat: add real-time chat functionality`
- `fix: resolve memory leak in WebSocket connections`
- `docs: update README with deployment instructions`

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Changes
- List of changes made
- Another change

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code builds successfully
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Reviewed by at least one team member
```

## Code Review Process

1. **Self-Review:** Review your own PR before requesting reviews
2. **Automated Checks:** Ensure CI passes (linting, tests, build)
3. **Peer Review:** At least one approval required
4. **Address Feedback:** Respond to all comments
5. **Final Check:** Re-run tests if needed
6. **Merge:** Squash and merge when ready

## Best Practices

### Do's ✅

- Keep commits small and focused
- Write descriptive commit messages
- Rebase regularly to stay updated
- Test locally before pushing
- Update documentation with code changes
- Keep PRs small and reviewable
- Request reviews early

### Don'ts ❌

- Don't commit directly to main or dev
- Don't push broken code
- Don't include unrelated changes in PR
- Don't merge without approval
- Don't commit sensitive data (.env files, secrets)
- Don't force push to shared branches

## Emergency Procedures

### Reverting a Bad Merge

```bash
# Find the merge commit
git log --oneline

# Revert the merge
git revert -m 1 <merge-commit-hash>
git push origin main
```

### Recovering Deleted Branch

```bash
# Find the commit
git reflog

# Recreate branch
git checkout -b feature/recovered <commit-hash>
```

## Getting Help

- Check [CONTRIBUTING.md](CONTRIBUTING.md) for general contribution guidelines
- Ask in team chat for workflow questions
- Create an issue for process improvements

---

**Remember:** Good Git practices lead to better collaboration and cleaner history!

# Contributing to Joachima

First off, thank you for considering contributing to Joachima! It's people like you that make Joachima such a great tool.

## Code Search Tips

When working with this codebase, here are some tips to help you find what you need:

### Directory Structure
```
quemiai/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/           # Next.js app directory (routes)
│   │   │   ├── components/    # React components
│   │   │   │   ├── search/   # Search-related components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   └── lib/          # Utilities and helpers
│   │   │       ├── search/   # Search utilities (fuzzy, regex, content-aware)
│   ├── backend/               # Express backend API
│   │   └── src/
│   │       ├── api/          # API routes
│   │       │   ├── search/   # Search endpoints
│   │       └── services/     # Business logic
│   └── mobile/               # React Native mobile app
├── packages/
│   ├── ui/                   # Shared UI components
│   └── shared/               # Shared utilities
├── docs/                     # Documentation
│   ├── SEARCH_GUIDE.md      # Search features documentation
│   └── API.md               # API reference
└── netlify/                  # Netlify deployment functions
```

### Finding Code
- **Search Components**: `apps/web/src/components/search/`
- **Search Utilities**: `apps/web/src/lib/search/`
- **Custom Hooks**: `apps/web/src/hooks/`
- **API Endpoints**: `apps/backend/src/api/`
- **Types**: `apps/web/src/lib/types.ts`

### Useful Commands
```bash
# Search for specific code patterns
grep -r "SearchFilters" apps/web/src

# Find all TypeScript files
find apps/web/src -name "*.tsx" -o -name "*.ts"

# Search for component usage
grep -r "EnhancedSearch" apps/web
```

## Where do I go from here?

If you've noticed a bug or have a feature request, [make one](https://github.com/joachimaross/JoachimaSocial/issues/new)! It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

### Fork & create a branch

If this is something you think you can fix, then [fork Joachima](https://github.com/joachimaross/JoachimaSocial/fork) and create a branch with a descriptive name.

A good branch name would be (where issue #38 is the ticket you're working on):

```sh
git checkout -b 38-add-awesome-new-feature
```

### Get the style right

Your patch should follow the same conventions & pass the same code quality checks as the rest of the project.

### Test your changes

- Run all the tests to see if everything is still working.
- Add tests for your new functionality.

### Rebase to master

Use `git rebase` (not `git merge`) to sync your work from time to time.

```sh
git fetch upstream
git rebase upstream/main
```

### Make a pull request

At this point, you should switch back to your master branch and make sure it's up to date with Joachima's master branch:

```sh
git remote add upstream git@github.com:joachimaross/JoachimaSocial.git
git checkout main
git pull upstream main
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 38-add-awesome-new-feature
git rebase main
git push --force-with-lease origin 38-add-awesome-new-feature
```

Finally, go to GitHub and [make a Pull Request](https://github.com/joachimaross/JoachimaSocial/compare) :D

### Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

To learn more about rebasing and merge conflicts, check out this guide on [how to rebase a Pull Request](https://github.com/joachimaross/JoachimaSocial/blob/main/docs/REBASE.md).

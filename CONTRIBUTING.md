# Contributing to Quemiai

First off, thank you for considering contributing to Quemiai! It's people like you that make Quemiai such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, [make one](https://github.com/joachimaross/quemiai/issues/new)! It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This leads to more readable messages that are easy to follow when looking through the project history.

### Commit Message Format

Each commit message consists of a **header**, an optional **body**, and an optional **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

The **header** is mandatory and must conform to the format.

#### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries
- **ci**: Changes to our CI configuration files and scripts
- **revert**: Reverts a previous commit

#### Scope

The scope should specify the place of the commit change. For example:

- **backend**: Changes to backend code
- **web**: Changes to web frontend
- **mobile**: Changes to mobile app
- **shared**: Changes to shared packages
- **ui**: Changes to UI components
- **auth**: Changes to authentication
- **api**: Changes to API endpoints
- **database**: Changes to database schema or migrations
- **deps**: Dependency updates

#### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end

#### Examples

```
feat(auth): add OAuth2 support for Google login
fix(api): resolve null pointer exception in user endpoint
docs(readme): update installation instructions
chore(deps): upgrade NestJS to version 11
test(backend): add unit tests for user service
refactor(web): simplify authentication flow
```

### Fork & create a branch

If this is something you think you can fix, then [fork Quemiai](https://github.com/joachimaross/quemiai/fork) and create a branch with a descriptive name.

A good branch name would be (where issue #38 is the ticket you're working on):

```sh
git checkout -b 38-add-awesome-new-feature
```

Branch naming conventions:
- `feature/issue-number-description` for new features
- `bugfix/issue-number-description` for bug fixes
- `hotfix/description` for urgent production fixes
- `docs/description` for documentation updates

### Get the style right

Your patch should follow the same conventions & pass the same code quality checks as the rest of the project.

#### Code Style

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Run `pnpm lint` to check your code
- Run `pnpm format` to format your code

#### Pre-commit Hooks

We use Husky to run pre-commit hooks that:
- Scan for secrets using git-secrets
- Run linting checks
- Ensure code quality

Make sure these pass before committing.

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

At this point, you should switch back to your main branch and make sure it's up to date with Quemiai's main branch:

```sh
git remote add upstream git@github.com:joachimaross/quemiai.git
git checkout main
git pull upstream main
```

Then update your feature branch from your local copy of main, and push it!

```sh
git checkout 38-add-awesome-new-feature
git rebase main
git push --force-with-lease origin 38-add-awesome-new-feature
```

Finally, go to GitHub and [make a Pull Request](https://github.com/joachimaross/quemiai/compare) :D

#### Pull Request Guidelines

- Follow the pull request template
- Ensure all tests pass
- Update documentation if needed
- Add tests for new functionality
- Keep pull requests focused and small
- Use conventional commit messages

### Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

To learn more about rebasing and merge conflicts, GitHub has a [helpful guide](https://docs.github.com/en/get-started/using-git/about-git-rebase).

## Security

If you discover a security vulnerability, please email security@quemiai.com instead of opening a public issue. We take security seriously and will respond promptly.

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

# Release Process

This document describes how to release a new version of domharvest-playwright.

## Prerequisites

1. You must have write access to the repository
2. You must have an npm account with access to publish the package
3. You must have set up the `NPM_TOKEN` secret in GitHub repository settings

## Release Steps

### 1. Ensure Clean State

Make sure all changes are committed and pushed to `main`:

```bash
git status
# Should show "nothing to commit, working tree clean"
```

### 2. Run Tests

Ensure all tests pass:

```bash
npm test
```

### 3. Create Release

Use one of the following commands based on the type of release:

**Patch Release** (bug fixes, 1.0.0 → 1.0.1):
```bash
npm run release:patch
```

**Minor Release** (new features, backward compatible, 1.0.0 → 1.1.0):
```bash
npm run release:minor
```

**Major Release** (breaking changes, 1.0.0 → 2.0.0):
```bash
npm run release:major
```

**Auto-detect from commits** (based on conventional commits):
```bash
npm run release
```

This will:
- Bump the version in `package.json`
- Generate/update `CHANGELOG.md`
- Create a git commit with the changes
- Create a git tag (e.g., `v1.0.1`)

### 4. Push to GitHub

Push the changes and tags to GitHub:

```bash
git push --follow-tags origin main
```

This will trigger:
- GitHub Actions to run tests
- Documentation deployment to GitHub Pages
- Automatic npm publication (when tag is pushed)

### 5. Verify Publication

After a few minutes, verify:

1. **GitHub Release**: Check https://github.com/domharvest/domharvest-playwright/releases
2. **npm Package**: Check https://www.npmjs.com/package/domharvest-playwright
3. **Documentation**: Check https://domharvest.dev

## Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic CHANGELOG generation.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature (triggers MINOR version bump)
- `fix`: A bug fix (triggers PATCH version bump)
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Breaking Changes

Add `BREAKING CHANGE:` in the footer to trigger a MAJOR version bump:

```
feat: redesign API interface

BREAKING CHANGE: The harvest() function signature has changed.
Old: harvest(url, selector)
New: harvest(url, selector, extractor)
```

## Examples

### Patch Release Example

```bash
# Make bug fixes
git add .
git commit -m "fix: resolve timeout issue in harvest method"

# Create patch release
npm run release:patch

# Push
git push --follow-tags origin main
```

### Minor Release Example

```bash
# Add new feature
git add .
git commit -m "feat: add support for multiple browsers"

# Create minor release
npm run release:minor

# Push
git push --follow-tags origin main
```

## Troubleshooting

### Failed npm Publication

If npm publication fails:

1. Check the `NPM_TOKEN` secret in GitHub settings
2. Verify you have publish rights to the package
3. Check GitHub Actions logs for details

### Failed Documentation Deployment

If documentation deployment fails:

1. Check GitHub Pages is enabled in repository settings
2. Verify GitHub Pages source is set to "GitHub Actions"
3. Check workflow logs in Actions tab

### Rollback a Release

If you need to rollback:

```bash
# Delete the tag locally
git tag -d v1.0.1

# Delete the tag remotely
git push origin :refs/tags/v1.0.1

# Revert the commit
git revert HEAD
git push origin main

# Deprecate the npm version
npm deprecate domharvest-playwright@1.0.1 "Version deprecated, use 1.0.0"
```

## First-time Setup

### npm Token

1. Login to npm: `npm login`
2. Generate a token: Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
3. Create a new "Automation" token
4. Add it to GitHub Secrets as `NPM_TOKEN`

### GitHub Pages

1. Go to repository Settings → Pages
2. Under "Build and deployment", set Source to "GitHub Actions"
   (The setting is saved automatically when you select it)

The next push to `main` will deploy the documentation.

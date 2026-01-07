# Contributing to domharvest-playwright

Thank you for your interest in contributing! We welcome contributions from everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/domharvest-playwright.git`
3. Install dependencies: `npm install`
4. Install Playwright browsers: `npm run playwright:install`

## Development Workflow (GitHub Flow)

We use **GitHub Flow** for our development process:

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style (Standard JS)

3. **Run linting** before committing:

   ```bash
   npm run lint:fix
   ```

4. **Commit your changes** with clear, descriptive messages:

   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub:
   - Use `gh pr create` or create it via the GitHub web interface
   - Provide a clear title and description
   - Reference any related issues

## Code Style

- We use [JavaScript Standard Style](https://standardjs.com/)
- Run `npm run lint` to check your code
- Run `npm run lint:fix` to automatically fix issues
- No semicolons, 2 spaces for indentation

## Commit Message Guidelines

Use clear and descriptive commit messages:

- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for changes to existing features
- `Remove:` for removing code or files
- `Docs:` for documentation changes
- `Refactor:` for code refactoring

Example: `Add: support for custom selectors in harvest function`

## Testing

- Write tests for new features
- Ensure all tests pass: `npm test`
- Test your changes manually

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all tests pass
5. Request review from maintainers
6. Address any feedback
7. Once approved, a maintainer will merge your PR

## Questions?

Feel free to open an issue for any questions or suggestions!

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Keep discussions on-topic

Thank you for contributing! 🎉

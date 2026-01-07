# domharvest-playwright

[![npm version](https://img.shields.io/npm/v/domharvest-playwright.svg)](https://www.npmjs.com/package/domharvest-playwright)
[![License](https://img.shields.io/npm/l/domharvest-playwright.svg)](https://github.com/domharvest/domharvest-playwright/blob/main/LICENSE.md)
[![Test](https://github.com/domharvest/domharvest-playwright/actions/workflows/test.yml/badge.svg)](https://github.com/domharvest/domharvest-playwright/actions/workflows/test.yml)
[![JavaScript Standard Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A powerful DOM harvesting tool built with Playwright for extracting and analyzing web content.

📚 **[Documentation](https://domharvest.github.io/domharvest-playwright/)** | 🚀 **[Quick Start](https://domharvest.github.io/domharvest-playwright/guide/quick-start)** | 📖 **[API Reference](https://domharvest.github.io/domharvest-playwright/api/harvester)**

## Features

- 🎯 Extract DOM elements with precision
- 🚀 Fast and reliable using Playwright
- 📦 Simple and clean API
- 🔧 Configurable selectors and filters
- 🎨 Export data in multiple formats

## Installation

```bash
npm install domharvest-playwright
```

Then install Playwright browsers:

```bash
npx playwright install
```

## Usage

### Quick Start

```javascript
import { harvest } from 'domharvest-playwright'

// Extract all paragraphs from a page
const paragraphs = await harvest(
  'https://example.com',
  'p',
  (el) => ({ text: el.textContent?.trim() })
)

console.log(paragraphs)
```

### Using DOMHarvester Class

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })

try {
  await harvester.init()

  // Extract links
  const links = await harvester.harvest(
    'https://example.com',
    'a',
    (el) => ({
      text: el.textContent?.trim(),
      href: el.href
    })
  )

  console.log(links)
} finally {
  await harvester.close()
}
```

### Custom Extraction

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester()
await harvester.init()

const pageData = await harvester.harvestCustom(
  'https://example.com',
  () => {
    return {
      title: document.title,
      headings: Array.from(document.querySelectorAll('h1, h2')).map(h => h.textContent),
      linkCount: document.querySelectorAll('a').length
    }
  }
)

await harvester.close()
```

### Run Examples

```bash
node examples/basic-example.js
```

## Development

```bash
# Clone the repository
git clone https://github.com/domharvest/domharvest-playwright.git
cd domharvest-playwright

# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run examples
node examples/basic-example.js

# Serve documentation locally
npm run docs:dev
```

## Release

See [RELEASE.md](RELEASE.md) for detailed release process.

Quick release:

```bash
# Patch release (1.0.0 → 1.0.1)
npm run release:patch

# Minor release (1.0.0 → 1.1.0)
npm run release:minor

# Major release (1.0.0 → 2.0.0)
npm run release:major

# Push to trigger npm publication
git push --follow-tags origin main
```

## Code Style

This project uses [JavaScript Standard Style](https://standardjs.com/).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Massimiliano Bertinetti

## Support

If you find this project helpful, please give it a ⭐️ on GitHub!

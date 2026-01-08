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

// Extract quotes from quotes.toscrape.com (a site designed for scraping practice)
const quotes = await harvest(
  'https://quotes.toscrape.com/',
  '.quote',
  (el) => ({
    text: el.querySelector('.text')?.textContent?.trim(),
    author: el.querySelector('.author')?.textContent?.trim(),
    tags: Array.from(el.querySelectorAll('.tag')).map(tag => tag.textContent?.trim())
  })
)

console.log(quotes)
```

### Using DOMHarvester Class

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })

try {
  await harvester.init()

  // Extract books from books.toscrape.com (a practice scraping site)
  const books = await harvester.harvest(
    'https://books.toscrape.com/',
    '.product_pod',
    (el) => ({
      title: el.querySelector('h3 a')?.getAttribute('title'),
      price: el.querySelector('.price_color')?.textContent?.trim(),
      availability: el.querySelector('.availability')?.textContent?.trim(),
      rating: el.querySelector('.star-rating')?.className.split(' ')[1]
    })
  )

  console.log(books)
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
  'https://quotes.toscrape.com/',
  () => {
    return {
      title: document.title,
      totalQuotes: document.querySelectorAll('.quote').length,
      authors: Array.from(new Set(
        Array.from(document.querySelectorAll('.author'))
          .map(a => a.textContent?.trim())
      )),
      allTags: Array.from(new Set(
        Array.from(document.querySelectorAll('.tag'))
          .map(t => t.textContent?.trim())
      ))
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

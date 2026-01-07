# domharvest-playwright

A powerful DOM harvesting tool built with Playwright for extracting and analyzing web content.

## Features

- 🎯 Extract DOM elements with precision
- 🚀 Fast and reliable using Playwright
- 📦 Simple and clean API
- 🔧 Configurable selectors and filters
- 🎨 Export data in multiple formats

## Installation

```bash
npm install
npm run playwright:install
```

## Usage

### Quick Start

```javascript
import { harvest } from './src/harvester.js'

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
import { DOMHarvester } from './src/harvester.js'

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
import { DOMHarvester } from './src/harvester.js'

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
# Install dependencies
npm install

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test
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

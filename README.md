# domharvest-playwright

[![npm version](https://img.shields.io/npm/v/domharvest-playwright.svg)](https://www.npmjs.com/package/domharvest-playwright)
[![License](https://img.shields.io/npm/l/domharvest-playwright.svg)](https://github.com/domharvest/domharvest-playwright/blob/main/LICENSE.md)
[![Test](https://github.com/domharvest/domharvest-playwright/actions/workflows/test.yml/badge.svg)](https://github.com/domharvest/domharvest-playwright/actions/workflows/test.yml)
[![JavaScript Standard Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A powerful DOM harvesting tool built with Playwright for extracting and analyzing web content.

📚 **[Documentation](https://domharvest.dev/domharvest-playwright/)** | 🚀 **[Quick Start](https://domharvest.dev/domharvest-playwright/guide/quick-start)** | 📖 **[API Reference](https://domharvest.dev/domharvest-playwright/api/harvester)**

## Features

- 🎯 **Precise DOM Extraction** - Extract elements with CSS selectors and custom extractors
- 🚀 **Built on Playwright** - Fast, reliable, and supports all modern browsers
- 📦 **Simple API** - Clean, intuitive interface with minimal boilerplate
- 🔄 **Retry Logic** - Automatic retries with exponential/linear backoff
- ⚡ **Rate Limiting** - Built-in rate limiting (global and per-domain)
- 📊 **Batch Processing** - Process multiple URLs concurrently with progress tracking
- 🛡️ **Enhanced Error Handling** - Custom error classes with detailed context
- 📝 **Structured Logging** - Debug, info, warn, and error levels with custom logger support
- ✅ **High Test Coverage** - 86%+ code coverage with comprehensive test suite
- 📚 **Fully Documented** - Complete JSDoc documentation for all public APIs
- 🎨 **Production Ready** - All features designed for real-world scraping scenarios

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

### Production-Ready Configuration

```javascript
import { DOMHarvester } from 'domharvest-playwright'

// Configure with retry logic, rate limiting, and logging
const harvester = new DOMHarvester({
  headless: true,
  timeout: 30000,
  rateLimit: {
    requests: 10,
    per: 60000 // 10 requests per minute
  },
  logging: {
    level: 'info'
  },
  onError: (error, context) => {
    console.error(`Error on ${context.url}:`, error.message)
  }
})

try {
  await harvester.init()

  // Extract with automatic retries
  const books = await harvester.harvest(
    'https://books.toscrape.com/',
    '.product_pod',
    (el) => ({
      title: el.querySelector('h3 a')?.getAttribute('title'),
      price: el.querySelector('.price_color')?.textContent?.trim(),
      availability: el.querySelector('.availability')?.textContent?.trim(),
      rating: el.querySelector('.star-rating')?.className.split(' ')[1]
    }),
    {
      retries: 3,
      backoff: 'exponential'
    }
  )

  console.log(`Extracted ${books.length} books`)
} finally {
  await harvester.close()
}
```

### Batch Processing Multiple Pages

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })
await harvester.init()

try {
  // Process multiple URLs concurrently
  const results = await harvester.harvestBatch([
    {
      url: 'https://quotes.toscrape.com/',
      selector: '.quote',
      extractor: (el) => ({
        text: el.querySelector('.text')?.textContent,
        author: el.querySelector('.author')?.textContent
      })
    },
    {
      url: 'https://quotes.toscrape.com/page/2/',
      selector: '.quote',
      extractor: (el) => ({
        text: el.querySelector('.text')?.textContent,
        author: el.querySelector('.author')?.textContent
      }),
      options: { retries: 3 } // Per-URL retry config
    },
    {
      url: 'https://books.toscrape.com/',
      selector: '.product_pod',
      extractor: (el) => ({
        title: el.querySelector('h3 a')?.getAttribute('title'),
        price: el.querySelector('.price_color')?.textContent
      })
    }
  ], {
    concurrency: 3,
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`)
    }
  })

  // Process results
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`Successful: ${successful.length}, Failed: ${failed.length}`)
  successful.forEach(r => {
    console.log(`${r.url}: ${r.data.length} items in ${r.duration}ms`)
  })
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

### Screenshots

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })
await harvester.init()

try {
  // Capture a full page screenshot
  await harvester.screenshot(
    'https://example.com',
    {
      path: './screenshots/homepage.png',
      fullPage: true
    }
  )

  // Get screenshot as buffer for processing
  const buffer = await harvester.screenshot(
    'https://example.com/chart',
    { type: 'png' },
    {
      waitForSelector: '.chart-loaded',
      waitForLoadState: 'networkidle'
    }
  )

  // Capture screenshot during harvest
  const data = await harvester.harvest(
    'https://example.com',
    '.products',
    (el) => ({ title: el.textContent }),
    {
      screenshot: {
        path: './screenshots/products.png',
        fullPage: false
      }
    }
  )
} finally {
  await harvester.close()
}
```

### Run Examples

```bash
node examples/basic-example.js
```

## Configuration Options

### Constructor Options

```javascript
const harvester = new DOMHarvester({
  // Browser options
  headless: true,           // Run in headless mode
  timeout: 30000,           // Navigation and selector timeout (ms)

  // Rate limiting
  rateLimit: {
    requests: 10,           // Number of requests
    per: 60000             // Time window (ms)
  },
  // OR per-domain limiting
  rateLimit: {
    global: { requests: 20, per: 60000 },
    perDomain: { requests: 5, per: 60000 }
  },

  // Logging
  logging: {
    level: 'info',          // 'debug', 'info', 'warn', 'error'
    logger: customLogger    // Optional: custom logger (Winston, Pino, etc.)
  },

  // Error handling
  onError: (error, context) => {
    console.error(`Error on ${context.url}:`, error.message)
  }
})
```

### Harvest Options

```javascript
await harvester.harvest(url, selector, extractor, {
  // Retry options
  retries: 3,               // Number of retry attempts (default: 0)
  backoff: 'exponential',   // 'exponential' or 'linear' (default: 'exponential')
  maxBackoff: 10000,        // Max backoff delay in ms (default: 10000)
  retryOn: ['TimeoutError'], // Only retry specific errors (optional)

  // Screenshot options
  screenshot: {
    path: './screenshot.png',
    fullPage: true
  },

  // Wait strategies
  waitForLoadState: 'networkidle', // 'load', 'domcontentloaded', 'networkidle'
  waitForSelector: {
    state: 'visible',
    timeout: 10000
  }
})
```

### Batch Options

```javascript
await harvester.harvestBatch(configs, {
  concurrency: 5,           // Concurrent requests (default: 5)
  onProgress: (done, total) => {
    console.log(`${done}/${total} completed`)
  }
})
```

### Advanced Browser Configuration

```javascript
const harvester = new DOMHarvester({
  // Proxy configuration
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  },

  // Viewport size
  viewport: {
    width: 1920,
    height: 1080
  },

  // Custom user agent
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',

  // Extra HTTP headers
  extraHTTPHeaders: {
    'Accept-Language': 'en-US,en;q=0.9',
    'X-Custom-Header': 'value'
  },

  // Cookies
  cookies: [
    {
      name: 'session_id',
      value: 'abc123',
      domain: '.example.com',
      path: '/',
      httpOnly: true,
      secure: true
    }
  ],

  // Locale and timezone
  locale: 'en-US',
  timezoneId: 'America/New_York',

  // Geolocation
  geolocation: {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 100
  },

  // Disable JavaScript (for static content)
  javaScriptEnabled: false
})
```

## Error Handling

domharvest-playwright provides custom error classes for better error handling:

```javascript
import { DOMHarvester, TimeoutError, NavigationError, ExtractionError } from 'domharvest-playwright'

try {
  const data = await harvester.harvest(url, selector, extractor, {
    retries: 3,
    backoff: 'exponential'
  })
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error(`Timeout: ${error.message}`)
    console.error(`URL: ${error.url}, Selector: ${error.selector}`)
  } else if (error instanceof NavigationError) {
    console.error(`Navigation failed: ${error.message}`)
  } else if (error instanceof ExtractionError) {
    console.error(`Extraction failed: ${error.message}`)
  }
}
```

**Error Properties:**
- `name` - Error type name
- `message` - Descriptive error message
- `url` - URL where the error occurred
- `selector` - CSS selector (if applicable)
- `operation` - The operation that failed
- `cause` - Original Playwright error

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

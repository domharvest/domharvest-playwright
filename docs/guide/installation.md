# Installation

## npm Installation

Install DOMHarvest from npm:

```bash
npm install domharvest-playwright
```

## Install Playwright Browsers

After installing the package, you need to install the Playwright browsers:

```bash
npx playwright install
```

This downloads the necessary browser binaries (Chromium, Firefox, and WebKit) that Playwright uses for automation.

## Verify Installation

Create a test file to verify everything is working:

```javascript
// test.js
import { harvest } from 'domharvest-playwright'

const result = await harvest(
  'https://example.com',
  'h1',
  (el) => ({ heading: el.textContent?.trim() })
)

console.log('Success!', result)
```

Run it:

```bash
node test.js
```

If you see the output with the heading from example.com, you're all set!

## Development Installation

If you want to contribute to DOMHarvest or run it from source:

```bash
# Clone the repository
git clone https://github.com/domharvest/domharvest-playwright.git
cd domharvest-playwright

# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install

# Run tests to verify
npm test

# Run examples
node examples/basic-example.js
```

## System Requirements

- **Node.js**: Version 18 or higher
- **Operating Systems**:
  - macOS (Intel and Apple Silicon)
  - Linux (Ubuntu, Debian, Fedora, CentOS)
  - Windows 10+
- **Disk Space**: ~500MB for browser binaries

## Troubleshooting

### Playwright Installation Issues

If you encounter issues installing Playwright browsers:

```bash
# Try with sudo on Linux/macOS
sudo npx playwright install

# Or set a custom download directory
PLAYWRIGHT_BROWSERS_PATH=~/pw-browsers npx playwright install
```

### Headless Mode Issues

Some systems may have issues with headless mode. You can run in headed mode:

```javascript
const harvester = new DOMHarvester({ headless: false })
```

### Timeout Errors

If you're scraping slow-loading pages, increase the timeout:

```javascript
const harvester = new DOMHarvester({ timeout: 60000 }) // 60 seconds
```

## Next Steps

Now that you have DOMHarvest installed, check out the [Quick Start Guide](/guide/quick-start) to begin scraping!

# Configuration

Learn how to configure DOMHarvester to suit your needs.

## Harvester Options

When creating a `DOMHarvester` instance, you can pass an options object:

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({
  headless: true,
  timeout: 30000
})
```

### Available Options

#### `headless`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Run the browser in headless mode (without UI)

```javascript
// Run with visible browser (useful for debugging)
const harvester = new DOMHarvester({ headless: false })
```

#### `timeout`

- **Type**: `number` (milliseconds)
- **Default**: `30000` (30 seconds)
- **Description**: Maximum time to wait for page navigation and selector matching

```javascript
// Increase timeout for slow pages
const harvester = new DOMHarvester({ timeout: 60000 }) // 60 seconds
```

## Browser Configuration

DOMHarvest uses Playwright's Chromium browser by default. The browser configuration is handled automatically, but you can access Playwright's full API when needed.

## Environment Variables

### Playwright Browser Path

Set a custom path for Playwright browsers:

```bash
export PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers
```

### Debug Mode

Enable Playwright debug logs:

```bash
export DEBUG=pw:api
```

## Best Practices

### Timeouts

Choose appropriate timeouts based on your use case:

```javascript
// Fast, static pages
const fastHarvester = new DOMHarvester({ timeout: 10000 })

// Slow, dynamic pages
const slowHarvester = new DOMHarvester({ timeout: 60000 })
```

### Headless vs Headed

- **Headless (default)**: Faster, uses less resources, ideal for production
- **Headed**: Useful for debugging, seeing what the browser is doing

```javascript
// Development/debugging
const devHarvester = new DOMHarvester({ headless: false })

// Production
const prodHarvester = new DOMHarvester({ headless: true })
```

### Resource Management

Always close the harvester when done:

```javascript
const harvester = new DOMHarvester()

try {
  await harvester.init()
  // ... scraping operations
} finally {
  await harvester.close() // Important!
}
```

### Rate Limiting

Add delays between requests to avoid overwhelming servers:

```javascript
async function scrapeWithDelay (urls) {
  const harvester = new DOMHarvester()
  await harvester.init()

  const results = []

  try {
    for (const url of urls) {
      const data = await harvester.harvest(url, '.content', el => ({
        text: el.textContent
      }))
      results.push(data)

      // Wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  } finally {
    await harvester.close()
  }

  return results
}
```

## Advanced: Custom Browser Context

While DOMHarvest manages the browser for you, you can access Playwright's context API if needed. The context is available via `harvester.context`:

```javascript
const harvester = new DOMHarvester()
await harvester.init()

// Access the underlying Playwright context
const context = harvester.context

// Example: Set custom viewport
await context.setViewportSize({ width: 1920, height: 1080 })

// Example: Set user agent
await context.setExtraHTTPHeaders({
  'User-Agent': 'Custom User Agent'
})
```

## Next Steps

- Explore [Examples](/guide/examples) for practical use cases
- Check the [API Reference](/api/harvester) for detailed method documentation

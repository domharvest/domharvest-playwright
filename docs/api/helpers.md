# Helper Functions

Convenience functions for common scraping tasks.

## `harvest()`

A convenience function for one-off harvesting operations. Creates a harvester instance, performs the harvest, and cleans up automatically.

**Signature:**
```javascript
async function harvest(url, selector, extractor?, options?)
```

**Parameters:**
- `url` (string) - The URL to navigate to
- `selector` (string) - CSS selector for elements to extract
- `extractor` (Function, optional) - Function to transform each element
- `options` (Object, optional) - Harvester configuration options
  - `headless` (boolean, default: `true`)
  - `timeout` (number, default: `30000`)

**Returns:** `Promise<Array>` - Array of extracted data

**Example:**

```javascript
import { harvest } from 'domharvest-playwright'

// Simple usage with default extractor
const headings = await harvest('https://example.com', 'h1')

// With custom extractor
const links = await harvest(
  'https://example.com',
  'a',
  (el) => ({
    text: el.textContent?.trim(),
    href: el.href
  })
)

// With custom options
const data = await harvest(
  'https://example.com',
  '.content',
  (el) => ({ text: el.textContent }),
  { headless: false, timeout: 60000 }
)
```

**When to Use:**

Use `harvest()` when:
- You need to scrape a single page
- You want minimal boilerplate code
- You don't need to reuse the browser instance

For multiple pages or operations, use the `DOMHarvester` class directly to reuse the browser:

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester()
await harvester.init()

try {
  const page1 = await harvester.harvest('https://example.com/1', '.item')
  const page2 = await harvester.harvest('https://example.com/2', '.item')
  const page3 = await harvester.harvest('https://example.com/3', '.item')
} finally {
  await harvester.close()
}
```

## Comparison: `harvest()` vs `DOMHarvester`

### Use `harvest()` for:
- Quick, one-time scraping
- Scripts or one-off tasks
- Simple use cases

```javascript
// One-liner for quick scraping
const data = await harvest('https://example.com', 'h1')
```

### Use `DOMHarvester` for:
- Multiple page scraping
- Performance-critical applications
- Complex workflows
- When you need access to Playwright features

```javascript
// Efficient for multiple operations
const harvester = new DOMHarvester()
await harvester.init()

for (const url of urls) {
  const data = await harvester.harvest(url, '.item')
  // Process data...
}

await harvester.close()
```

## Best Practices

### Resource Management

The `harvest()` function automatically manages resources:

```javascript
// Browser is automatically created and closed
const data = await harvest('https://example.com', '.item')
// All cleaned up, no need to call close()
```

### Error Handling

Always handle errors:

```javascript
try {
  const data = await harvest('https://example.com', '.selector')
  console.log(data)
} catch (error) {
  console.error('Scraping failed:', error.message)
}
```

### Rate Limiting

Add delays when scraping multiple URLs:

```javascript
const urls = ['https://example.com/1', 'https://example.com/2']
const results = []

for (const url of urls) {
  const data = await harvest(url, '.content')
  results.push(data)

  // Wait 1 second between requests
  await new Promise(resolve => setTimeout(resolve, 1000))
}
```

## Type Definitions

For TypeScript users (future support):

```typescript
function harvest<T = any>(
  url: string,
  selector: string,
  extractor?: (element: Element) => T,
  options?: {
    headless?: boolean
    timeout?: number
  }
): Promise<T[]>
```

## Next Steps

- See the [DOMHarvester API](/api/harvester) for full class documentation
- Check [Examples](/guide/examples) for practical usage patterns

# DOMHarvester API

Complete API reference for the `DOMHarvester` class.

## Constructor

### `new DOMHarvester(options)`

Creates a new DOMHarvester instance.

**Parameters:**
- `options` (Object, optional)
  - `headless` (boolean, default: `true`) - Run browser in headless mode
  - `timeout` (number, default: `30000`) - Timeout in milliseconds

**Example:**
```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({
  headless: true,
  timeout: 30000
})
```

## Methods

### `init()`

Initializes the browser and context.

**Returns:** `Promise<void>`

**Example:**
```javascript
await harvester.init()
```

**Note:** Must be called before any harvest operations.

---

### `close()`

Closes the browser and context, cleaning up resources.

**Returns:** `Promise<void>`

**Example:**
```javascript
await harvester.close()
```

**Note:** Always call this when done to prevent resource leaks.

---

### `harvest(url, selector, extractor)`

Navigates to a URL and extracts data using a CSS selector.

**Parameters:**
- `url` (string) - The URL to navigate to
- `selector` (string) - CSS selector for elements to extract
- `extractor` (Function, optional) - Function to transform each element

**Returns:** `Promise<Array>` - Array of extracted data

**Extractor Function:**
The extractor receives a DOM element and should return the data to extract:

```javascript
(element) => {
  // Return whatever data structure you want
  return {
    text: element.textContent?.trim(),
    href: element.href
  }
}
```

If no extractor is provided, returns default data:
```javascript
{
  text: element.textContent?.trim(),
  html: element.innerHTML,
  tag: element.tagName.toLowerCase()
}
```

**Examples:**

Simple extraction:
```javascript
const headings = await harvester.harvest(
  'https://example.com',
  'h1'
)
// Returns: [{ text: '...', html: '...', tag: 'h1' }]
```

Custom extraction:
```javascript
const links = await harvester.harvest(
  'https://example.com',
  'a',
  (el) => ({
    text: el.textContent?.trim(),
    url: el.href,
    external: !el.href.includes('example.com')
  })
)
```

---

### `harvestCustom(url, pageFunction)`

Navigates to a URL and executes a custom function in the page context.

**Parameters:**
- `url` (string) - The URL to navigate to
- `pageFunction` (Function) - Function to execute in the browser context

**Returns:** `Promise<any>` - Result of the page function

**Page Function:**
The function runs in the browser context and has access to the DOM:

```javascript
() => {
  // This runs in the browser
  return {
    title: document.title,
    // ... any data extraction logic
  }
}
```

**Example:**

```javascript
const pageData = await harvester.harvestCustom(
  'https://example.com',
  () => {
    return {
      title: document.title,
      meta: {
        description: document.querySelector('meta[name="description"]')?.content,
        author: document.querySelector('meta[name="author"]')?.content
      },
      stats: {
        paragraphs: document.querySelectorAll('p').length,
        images: document.querySelectorAll('img').length,
        links: document.querySelectorAll('a').length
      },
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        level: h.tagName,
        text: h.textContent?.trim()
      }))
    }
  }
)
```

## Properties

### `browser`

The Playwright browser instance. Available after calling `init()`.

**Type:** `Browser | null`

---

### `context`

The Playwright browser context. Available after calling `init()`.

**Type:** `BrowserContext | null`

---

### `options`

The configuration options for this harvester.

**Type:** `Object`
- `headless` (boolean)
- `timeout` (number)

## Usage Pattern

The recommended usage pattern is:

```javascript
const harvester = new DOMHarvester(options)

try {
  await harvester.init()

  // Perform multiple harvesting operations
  const data1 = await harvester.harvest(...)
  const data2 = await harvester.harvestCustom(...)

} finally {
  // Always close, even if errors occur
  await harvester.close()
}
```

## Error Handling

All methods can throw errors. Common error scenarios:

- Navigation timeout
- Selector not found
- Invalid URL
- Network errors

Always wrap harvesting operations in try/catch:

```javascript
try {
  await harvester.init()
  const data = await harvester.harvest('https://example.com', '.content')
  console.log(data)
} catch (error) {
  console.error('Harvesting failed:', error.message)
} finally {
  await harvester.close()
}
```

## Next Steps

- See [Helper Functions](/api/helpers) for convenience methods
- Check [Examples](/guide/examples) for practical usage

# DOMHarvester API

Complete API reference for the `DOMHarvester` class.

## Constructor

### `new DOMHarvester(options)`

Creates a new DOMHarvester instance.

**Parameters:**
- `options` (Object, optional)
  - `headless` (boolean, default: `true`) - Run browser in headless mode
  - `timeout` (number, default: `30000`) - Timeout in milliseconds
  - `rateLimit` (Object, optional) - Rate limiting configuration
    - `requests` (number) - Number of requests allowed
    - `per` (number) - Time window in milliseconds
    - `global` (Object, optional) - Global rate limit (same structure as above)
    - `perDomain` (Object, optional) - Per-domain rate limit
  - `logging` (Object, optional) - Logging configuration
    - `level` (string, default: `'info'`) - Log level: `'debug'`, `'info'`, `'warn'`, or `'error'`
    - `logger` (Object, optional) - Custom logger with `.debug()`, `.info()`, `.warn()`, `.error()` methods
  - `onError` (Function, optional) - Error callback: `(error, context) => {}`
  - `proxy` (Object, optional) - Proxy server configuration
    - `server` (string) - Proxy server URL (e.g., `'http://proxy.example.com:8080'`)
    - `username` (string, optional) - Proxy username
    - `password` (string, optional) - Proxy password
  - `viewport` (Object, optional) - Browser viewport size
    - `width` (number) - Viewport width in pixels
    - `height` (number) - Viewport height in pixels
  - `userAgent` (string, optional) - Custom user agent string
  - `extraHTTPHeaders` (Object, optional) - Extra HTTP headers to send with every request
  - `cookies` (Array, optional) - Cookies to set in the browser context
  - `geolocation` (Object, optional) - Geolocation override
    - `latitude` (number) - Latitude
    - `longitude` (number) - Longitude
    - `accuracy` (number, optional) - Accuracy in meters
  - `timezoneId` (string, optional) - Timezone ID (e.g., `'America/New_York'`)
  - `locale` (string, optional) - Locale (e.g., `'en-US'`)
  - `javaScriptEnabled` (boolean, default: `true`) - Enable or disable JavaScript

**Examples:**

Basic configuration:
```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({
  headless: true,
  timeout: 30000
})
```

Production-ready configuration with rate limiting and logging:
```javascript
const harvester = new DOMHarvester({
  headless: true,
  timeout: 30000,
  rateLimit: {
    requests: 10,
    per: 60000 // 10 requests per minute
  },
  logging: {
    level: 'info'
  }
})
```

Advanced configuration with per-domain rate limiting and error handling:
```javascript
const harvester = new DOMHarvester({
  headless: true,
  timeout: 30000,
  rateLimit: {
    global: { requests: 20, per: 60000 },
    perDomain: { requests: 5, per: 60000 }
  },
  logging: {
    level: 'debug',
    logger: customLogger // Winston, Pino, etc.
  },
  onError: (error, context) => {
    console.error(`Error at ${context.url}:`, error.message)
  }
})
```

Configuration with proxy, custom headers, and browser context options:
```javascript
const harvester = new DOMHarvester({
  headless: true,
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  },
  viewport: {
    width: 1920,
    height: 1080
  },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  extraHTTPHeaders: {
    'Accept-Language': 'en-US,en;q=0.9',
    'X-Custom-Header': 'value'
  },
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
  locale: 'en-US',
  timezoneId: 'America/New_York'
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

### `harvest(url, selector, extractor, options)`

Navigates to a URL and extracts data using a CSS selector.

**Parameters:**
- `url` (string) - The URL to navigate to
- `selector` (string) - CSS selector for elements to extract
- `extractor` (Function, optional) - Function to transform each element
- `options` (Object, optional) - Operation options
  - `retries` (number, default: `0`) - Number of retry attempts
  - `backoff` (string, default: `'exponential'`) - Backoff strategy: `'exponential'` or `'linear'`
  - `maxBackoff` (number, default: `10000`) - Maximum backoff delay in milliseconds
  - `retryOn` (Array&lt;string&gt;, optional) - Error names to retry on (e.g., `['TimeoutError']`)
  - `screenshot` (Object, optional) - Screenshot options (see Playwright screenshot API)
    - `path` (string, optional) - File path to save screenshot
    - `type` (string, optional) - Screenshot type: `'png'` or `'jpeg'`
    - `fullPage` (boolean, optional) - Capture full scrollable page
  - `waitForLoadState` (string, default: `'domcontentloaded'`) - Wait until: `'load'`, `'domcontentloaded'`, or `'networkidle'`
  - `waitForSelector` (Object, optional) - Selector wait options
    - `state` (string, optional) - Wait for state: `'attached'`, `'detached'`, `'visible'`, or `'hidden'`
    - `timeout` (number, optional) - Custom timeout for selector

**Returns:** `Promise<Array>` - Array of extracted data

**Throws:**
- `TimeoutError` - When selector timeout occurs
- `NavigationError` - When page navigation fails
- `ExtractionError` - When data extraction fails

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

With retry logic:
```javascript
const data = await harvester.harvest(
  'https://example.com',
  '.product',
  (el) => ({
    title: el.querySelector('h2')?.textContent,
    price: el.querySelector('.price')?.textContent
  }),
  {
    retries: 3,
    backoff: 'exponential',
    maxBackoff: 10000
  }
)
```

Retry only specific errors:
```javascript
const data = await harvester.harvest(
  'https://example.com',
  '.content',
  null,
  {
    retries: 5,
    backoff: 'linear',
    retryOn: ['TimeoutError', 'NavigationError']
  }
)
```

With screenshot capture:
```javascript
const data = await harvester.harvest(
  'https://example.com',
  '.product',
  null,
  {
    screenshot: {
      path: './screenshots/page.png',
      fullPage: true
    }
  }
)
```

With custom wait strategies:
```javascript
// Wait for network to be idle before extraction
const data = await harvester.harvest(
  'https://example.com',
  '.dynamic-content',
  null,
  {
    waitForLoadState: 'networkidle',
    waitForSelector: {
      state: 'visible',
      timeout: 10000
    }
  }
)
```

---

### `harvestBatch(configs, options)`

Harvest multiple URLs in batch with concurrency control.

**Parameters:**
- `configs` (Array&lt;Object&gt;) - Array of harvest configurations
  - `url` (string) - The URL to navigate to
  - `selector` (string) - CSS selector for elements
  - `extractor` (Function, optional) - Extraction function
  - `options` (Object, optional) - Individual harvest options (retries, backoff, etc.)
- `options` (Object, optional) - Batch options
  - `concurrency` (number, default: `5`) - Number of concurrent requests
  - `onProgress` (Function, optional) - Progress callback: `(completed, total) => {}`

**Returns:** `Promise<Array<Result\>>` - Array of results

**Result Object:**
- `success` (boolean) - Whether the harvest succeeded
- `url` (string) - The URL that was harvested
- `duration` (number) - Time taken in milliseconds
- `data` (Array, if success) - Extracted data
- `error` (string, if failure) - Error message
- `errorName` (string, if failure) - Error type

### `harvestCustom(url, pageFunction, options)`

Navigates to a URL and executes a custom function in the page context.

**Parameters:**
- `url` (string) - The URL to navigate to
- `pageFunction` (Function) - Function to execute in the browser context
- `options` (Object, optional) - Operation options (same as `harvest()`)
  - `retries` (number, default: `0`)
  - `backoff` (string, default: `'exponential'`)
  - `maxBackoff` (number, default: `10000`)
  - `retryOn` (Array&lt;string&gt;, optional)

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

::: v-pre
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
:::

---

### `screenshot(url, screenshotOptions, options)`

Capture a screenshot of a page.

**Parameters:**
- `url` (string) - The URL to navigate to
- `screenshotOptions` (Object, optional) - Screenshot options
  - `path` (string, optional) - File path to save the screenshot
  - `type` (string, default: `'png'`) - Image type: `'png'` or `'jpeg'`
  - `quality` (number, optional) - JPEG quality (0-100), only for jpeg
  - `fullPage` (boolean, default: `false`) - Capture the full scrollable page
  - `clip` (Object, optional) - Clip area with `{ x, y, width, height }`
- `options` (Object, optional) - Navigation options
  - `waitForLoadState` (string, default: `'domcontentloaded'`) - Load state to wait for
  - `waitForSelector` (string, optional) - Wait for specific selector before capturing

**Returns:** `Promise<Buffer>` - Screenshot buffer

**Throws:**
- `NavigationError` - When navigation or screenshot capture fails

**Examples:**

Save screenshot to file:
```javascript
await harvester.screenshot(
  'https://example.com',
  {
    path: './screenshots/homepage.png',
    fullPage: true
  }
)
```

Get screenshot as buffer:
```javascript
const buffer = await harvester.screenshot(
  'https://example.com',
  { type: 'png' }
)
// Use buffer for further processing
```

Wait for element before capturing:
```javascript
await harvester.screenshot(
  'https://example.com',
  {
    path: './screenshots/chart.png',
    clip: { x: 0, y: 0, width: 800, height: 600 }
  },
  {
    waitForSelector: '.chart-loaded',
    waitForLoadState: 'networkidle'
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

All methods can throw custom error classes with detailed context:

### Error Classes

#### `TimeoutError`

Thrown when a timeout occurs (navigation, selector waiting, etc.).

**Properties:**
- `name` - `'TimeoutError'`
- `message` - Descriptive error message
- `url` - The URL being accessed
- `selector` - The CSS selector (if applicable)
- `operation` - The operation that timed out
- `cause` - The original Playwright error

**Example:**
```javascript
try {
  await harvester.harvest('https://example.com', '.missing-selector')
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.error(`Timeout on ${error.url} for selector ${error.selector}`)
  }
}
```

#### `NavigationError`

Thrown when page navigation fails.

**Properties:**
- `name` - `'NavigationError'`
- `message` - Descriptive error message
- `url` - The URL that failed to load
- `operation` - `'navigation'` or `'initialization'`
- `cause` - The original error

**Example:**
```javascript
try {
  await harvester.harvest('http://invalid-domain.test', '.content')
} catch (error) {
  if (error.name === 'NavigationError') {
    console.error(`Failed to navigate to ${error.url}`)
  }
}
```

#### `ExtractionError`

Thrown when data extraction fails.

**Properties:**
- `name` - `'ExtractionError'`
- `message` - Descriptive error message
- `url` - The URL where extraction failed
- `selector` - The CSS selector used
- `operation` - `'extraction'`
- `cause` - The original error

### Error Handling with Callbacks

Use the `onError` callback for centralized error handling:

```javascript
const harvester = new DOMHarvester({
  headless: true,
  onError: (error, context) => {
    // Log to external service
    logger.error('Harvest failed', {
      errorName: error.name,
      message: error.message,
      url: context.url,
      timestamp: context.timestamp
    })
  }
})
```

### Retry on Errors

Use retry logic to handle transient errors:

```javascript
try {
  const data = await harvester.harvest(
    'https://example.com',
    '.content',
    null,
    {
      retries: 3,
      backoff: 'exponential',
      retryOn: ['TimeoutError', 'NavigationError'] // Only retry these errors
    }
  )
} catch (error) {
  // Error persisted after 3 retries
  console.error('Failed after retries:', error.message)
}
```

### Error Handling Pattern

The recommended error handling pattern:

```javascript
import { DOMHarvester, TimeoutError, NavigationError, ExtractionError } from 'domharvest-playwright'

const harvester = new DOMHarvester({
  headless: true,
  onError: (error, context) => {
    console.error(`Error in ${context.operation}:`, error.message)
  }
})

try {
  await harvester.init()
  const data = await harvester.harvest('https://example.com', '.content', null, {
    retries: 3,
    backoff: 'exponential'
  })
  console.log(`Successfully extracted ${data.length} items`)
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Timeout:', error.message)
  } else if (error instanceof NavigationError) {
    console.error('Navigation failed:', error.message)
  } else if (error instanceof ExtractionError) {
    console.error('Extraction failed:', error.message)
  } else {
    console.error('Unknown error:', error)
  }
} finally {
  await harvester.close()
}
```

## Next Steps

- See [Helper Functions](/api/helpers) for convenience methods
- Check [Examples](/guide/examples) for practical usage
- Read [Getting Started](/guide/getting-started) for a comprehensive guide

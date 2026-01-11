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

## Advanced Configuration

### Logging

Configure structured logging with different levels:

```javascript
const harvester = new DOMHarvester({
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    logger: customLogger // Optional: Winston, Pino, etc.
  }
})
```

**Custom Logger Example:**
```javascript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'scraping.log' })]
})

const harvester = new DOMHarvester({
  logging: {
    level: 'debug',
    logger
  }
})
```

### Rate Limiting

Built-in rate limiting to avoid overwhelming servers:

```javascript
// Global rate limit
const harvester = new DOMHarvester({
  rateLimit: {
    requests: 10,
    per: 60000 // 10 requests per minute
  }
})

// Per-domain rate limiting
const harvester = new DOMHarvester({
  rateLimit: {
    global: { requests: 20, per: 60000 },
    perDomain: { requests: 5, per: 60000 }
  }
})
```

### Retry Logic

Automatic retries with exponential or linear backoff:

```javascript
const data = await harvester.harvest(
  'https://example.com',
  '.content',
  null,
  {
    retries: 3,
    backoff: 'exponential', // or 'linear'
    maxBackoff: 10000,
    retryOn: ['TimeoutError', 'NavigationError'] // Only retry these errors
  }
)
```

### Error Handling

Centralized error handling with callbacks:

```javascript
const harvester = new DOMHarvester({
  onError: (error, context) => {
    console.error(`Error on ${context.url}:`, error.message)
    // Log to external service, send alert, etc.
  }
})
```

### Proxy Configuration

Route requests through a proxy server:

```javascript
const harvester = new DOMHarvester({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  }
})
```

### Browser Context Options

Customize the browser environment:

```javascript
const harvester = new DOMHarvester({
  // Viewport
  viewport: {
    width: 1920,
    height: 1080
  },

  // User Agent
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',

  // Custom Headers
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

  // Geolocation
  geolocation: {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 100
  },

  // Timezone & Locale
  timezoneId: 'America/New_York',
  locale: 'en-US',

  // JavaScript toggle
  javaScriptEnabled: true // Set to false for static content
})
```

### Screenshots

Capture screenshots during or after scraping:

```javascript
// Screenshot during harvest
const data = await harvester.harvest(
  'https://example.com',
  '.content',
  null,
  {
    screenshot: {
      path: './screenshots/page.png',
      fullPage: true
    }
  }
)

// Standalone screenshot
const buffer = await harvester.screenshot(
  'https://example.com',
  { type: 'png', fullPage: true }
)
```

### Wait Strategies

Fine-tune when operations should proceed:

```javascript
const data = await harvester.harvest(
  'https://example.com',
  '.dynamic-content',
  null,
  {
    // Wait for network to be idle
    waitForLoadState: 'networkidle', // 'load', 'domcontentloaded', 'networkidle'

    // Custom selector wait
    waitForSelector: {
      state: 'visible', // 'attached', 'detached', 'visible', 'hidden'
      timeout: 10000
    }
  }
)
```

## Production Configuration Example

Complete production-ready setup:

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({
  headless: true,
  timeout: 30000,

  // Rate limiting
  rateLimit: {
    global: { requests: 20, per: 60000 },
    perDomain: { requests: 5, per: 60000 }
  },

  // Logging
  logging: {
    level: 'info',
    logger: productionLogger
  },

  // Error handling
  onError: (error, context) => {
    errorTracker.log(error, context)
  },

  // Proxy
  proxy: {
    server: process.env.PROXY_SERVER
  },

  // Browser context
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (compatible; MyBot/1.0)',
  locale: 'en-US'
})
```

## Browser Configuration

DOMHarvest uses Playwright's Chromium browser by default. The browser configuration is handled automatically through the options above.

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


## Next Steps

- Explore [Examples](/guide/examples) for practical use cases
- Check the [API Reference](/api/harvester) for detailed method documentation

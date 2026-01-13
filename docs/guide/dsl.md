# Declarative DSL

DOMHarvest Playwright provides a powerful Domain Specific Language (DSL) for declarative data extraction. The DSL offers cleaner, more readable scraping patterns while maintaining backward compatibility with custom functions.

## Why Use DSL?

Traditional function-based extraction:
```javascript
const data = await harvester.harvest('https://example.com', '.product', (el) => ({
  name: el.querySelector('h2')?.textContent?.trim(),
  price: el.querySelector('.price')?.textContent?.trim(),
  link: el.querySelector('a')?.getAttribute('href')
}))
```

With DSL:
```javascript
import { text, attr } from 'domharvest-playwright'

const data = await harvester.harvest('https://example.com', '.product', {
  name: text('h2'),
  price: text('.price'),
  link: attr('a', 'href')
})
```

Benefits:
- More concise and readable
- Less boilerplate code
- Built-in null safety
- Optimized browser-side execution
- Type-safe with JSDoc

## DSL Helper Functions

### text()

Extract text content from an element.

```javascript
import { text } from 'domharvest-playwright'

// Basic usage
text('.title')

// With options
text('.description', {
  trim: true,        // Remove whitespace (default: true)
  default: 'N/A'     // Default value if not found
})

// Current element (no selector)
text()
```

**Parameters:**
- `selector` (string, optional): CSS selector relative to current element
- `options.trim` (boolean): Trim whitespace (default: `true`)
- `options.default` (any): Default value if element not found (default: `null`)

### attr()

Extract attribute value from an element.

```javascript
import { attr } from 'domharvest-playwright'

// Basic usage
attr('a', 'href')
attr('img', 'src')

// With default value
attr('div', 'data-id', { default: '0' })
```

**Parameters:**
- `selector` (string): CSS selector relative to current element
- `attribute` (string): Attribute name to extract
- `options.default` (any): Default value if attribute not found (default: `null`)

### array()

Extract an array of elements matching a selector.

```javascript
import { array, text } from 'domharvest-playwright'

// Array of text values
array('.tag', text())

// Array of objects
array('.comment', {
  author: text('.author'),
  message: text('.message')
})

// Array with custom function
array('.item', (el) => el.textContent)
```

**Parameters:**
- `selector` (string): CSS selector for array items
- `extractor` (DSL|Object|Function): Extractor for each item

### exists()

Check if an element exists.

```javascript
import { exists } from 'domharvest-playwright'

// Returns true/false
exists('.premium-badge')
exists('.out-of-stock')
```

**Parameters:**
- `selector` (string): CSS selector to check

**Returns:** `boolean`

### html()

Extract HTML content from an element.

```javascript
import { html } from 'domharvest-playwright'

// Basic usage
html('.content')

// With default value
html('.description', { default: '' })
```

**Parameters:**
- `selector` (string): CSS selector relative to current element
- `options.default` (any): Default value if element not found (default: `null`)

### count()

Count elements matching a selector.

```javascript
import { count } from 'domharvest-playwright'

// Count matching elements
count('.item')
count('.review')
```

**Parameters:**
- `selector` (string): CSS selector to count

**Returns:** `number`

## Complete Example

Here's a real-world example scraping product data:

```javascript
import { DOMHarvester, text, attr, array, exists, count } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })
await harvester.init()

try {
  const products = await harvester.harvest(
    'https://example-shop.com/products',
    '.product',
    {
      // Basic fields
      title: text('h2.title'),
      description: text('.description', { default: 'No description' }),
      price: text('.price'),

      // Attributes
      image: attr('img', 'src'),
      link: attr('a.product-link', 'href'),

      // Existence checks
      inStock: exists('.in-stock'),
      featured: exists('.featured-badge'),

      // Counts
      reviewCount: count('.review'),
      imageCount: count('.gallery img'),

      // Arrays
      tags: array('.tag', text()),
      sizes: array('.size', attr('', 'data-size')),

      // Nested objects
      rating: {
        score: text('.rating-score'),
        count: text('.rating-count')
      },

      // Array of objects
      reviews: array('.review', {
        author: text('.author'),
        rating: text('.stars'),
        comment: text('.comment')
      })
    }
  )

  console.log(products)
} finally {
  await harvester.close()
}
```

## Nested Objects

DSL supports nested object structures:

```javascript
{
  product: {
    details: {
      name: text('.name'),
      sku: text('.sku')
    },
    pricing: {
      current: text('.price'),
      original: text('.original-price')
    }
  }
}
```

## Mixed Mode (DSL + Custom Functions)

You can mix DSL helpers with custom functions:

```javascript
{
  // DSL helpers
  title: text('.title'),
  price: text('.price'),

  // Custom function
  priceNumber: (el) => {
    const priceText = el.querySelector('.price')?.textContent
    return parseFloat(priceText?.replace(/[^0-9.]/g, ''))
  },

  // Nested with mixed mode
  meta: {
    timestamp: text('.date'),
    custom: (el) => new Date().toISOString()
  }
}
```

Mixed mode automatically falls back to Node.js-side execution when custom functions are detected.

## Default Values

All DSL helpers support default values for missing elements:

```javascript
{
  title: text('.title', { default: 'Untitled' }),
  price: text('.price', { default: '$0.00' }),
  description: html('.description', { default: '<p>No description</p>' }),
  stock: attr('div', 'data-stock', { default: '0' })
}
```

## Working with Current Element

Use DSL helpers without a selector to operate on the current element:

```javascript
// Extract text from current element
array('.tag', text())

// Check if current element exists
array('.item', exists())

// Get HTML of current elements
array('.content', html())
```

## Performance

### Pure DSL (Optimized)

When using only DSL helpers, extraction happens entirely in the browser context for maximum performance:

```javascript
{
  title: text('.title'),
  price: text('.price'),
  tags: array('.tag', text())
}
```

### Mixed Mode (Node.js Side)

When mixing DSL with custom functions, execution happens on the Node.js side:

```javascript
{
  title: text('.title'),
  custom: (el) => el.dataset.id  // Falls back to Node.js execution
}
```

Both approaches are efficient, but pure DSL provides a slight performance advantage.

## Migration from Function Extractors

Migrating from function-based extractors is straightforward:

**Before:**
```javascript
const data = await harvester.harvest(url, '.item', (el) => ({
  title: el.querySelector('.title')?.textContent?.trim(),
  link: el.querySelector('a')?.getAttribute('href'),
  tags: Array.from(el.querySelectorAll('.tag')).map(tag => tag.textContent?.trim())
}))
```

**After:**
```javascript
import { text, attr, array } from 'domharvest-playwright'

const data = await harvester.harvest(url, '.item', {
  title: text('.title'),
  link: attr('a', 'href'),
  tags: array('.tag', text())
})
```

## Backward Compatibility

DSL is fully backward compatible. You can:
- Use function extractors exclusively (existing code continues to work)
- Use DSL exclusively (recommended for new code)
- Mix both approaches (gradual migration)

```javascript
// Old style - still works
const data1 = await harvester.harvest(url, '.item', (el) => ({
  title: el.querySelector('.title')?.textContent
}))

// New DSL style
const data2 = await harvester.harvest(url, '.item', {
  title: text('.title')
})

// Mixed
const data3 = await harvester.harvest(url, '.item', {
  title: text('.title'),
  custom: (el) => el.dataset.id
})
```

## Best Practices

### 1. Use DSL for Simple Extractions

DSL is ideal for straightforward data extraction:

```javascript
// Good - simple, clear
{
  name: text('.name'),
  price: text('.price'),
  link: attr('a', 'href')
}
```

### 2. Use Custom Functions for Complex Logic

Use custom functions when you need data transformation or complex logic:

```javascript
{
  // Simple extraction with DSL
  priceText: text('.price'),

  // Complex transformation with function
  priceNumber: (el) => {
    const text = el.querySelector('.price')?.textContent
    return parseFloat(text?.replace(/[^0-9.]/g, '')) || 0
  }
}
```

### 3. Provide Default Values

Always provide sensible defaults to handle missing elements:

```javascript
{
  title: text('.title', { default: 'Untitled' }),
  description: text('.description', { default: '' }),
  count: count('.item') // count() returns 0 by default
}
```

### 4. Use Nested Objects for Organization

Group related fields using nested objects:

```javascript
{
  product: {
    name: text('.name'),
    sku: text('.sku')
  },
  pricing: {
    current: text('.current-price'),
    original: text('.original-price'),
    discount: text('.discount')
  }
}
```

### 5. Leverage Type Safety

Import DSL helpers with explicit imports for better IDE support:

```javascript
import { text, attr, array, exists, html, count } from 'domharvest-playwright'
```

## Testing DSL Extractors

Test your DSL extractors just like function extractors:

```javascript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DOMHarvester, text, array } from 'domharvest-playwright'

test('should extract product data with DSL', async () => {
  const harvester = new DOMHarvester({ headless: true })
  await harvester.init()

  try {
    const data = await harvester.harvest(
      'https://example.com/products',
      '.product',
      {
        title: text('.title'),
        tags: array('.tag', text())
      }
    )

    assert.ok(Array.isArray(data))
    assert.ok(data[0].title)
    assert.ok(Array.isArray(data[0].tags))
  } finally {
    await harvester.close()
  }
})
```

## Next Steps

- Explore [Examples](/guide/examples) for practical DSL usage patterns
- Check [API Reference](/api/dsl) for complete DSL helper documentation
- Read [Testing Guide](/guide/testing) for testing DSL extractors

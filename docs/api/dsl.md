# DSL API Reference

Complete API reference for DOMHarvest's declarative DSL helpers.

## Import

```javascript
import {
  text,
  attr,
  array,
  exists,
  html,
  count
} from 'domharvest-playwright'
```

## text()

Extract text content from an element with automatic trimming and null safety.

### Signature

```typescript
function text(selector?: string, options?: TextOptions): DSLHelper
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `selector` | `string` | No | - | CSS selector relative to current element. Omit to use current element. |
| `options` | `TextOptions` | No | `{}` | Extraction options |
| `options.trim` | `boolean` | No | `true` | Trim whitespace from text |
| `options.default` | `any` | No | `null` | Default value if element not found |

### Returns

DSL helper object that can be used in schema definitions.

### Examples

```javascript
// Extract text from selector
text('.title')

// Extract from current element
text()

// Disable trimming
text('.raw-text', { trim: false })

// With default value
text('.optional', { default: 'N/A' })
```

### Usage in Schema

```javascript
await harvester.harvest(url, '.item', {
  title: text('.title'),
  description: text('.description', { default: 'No description' }),
  raw: text('.content', { trim: false })
})
```

---

## attr()

Extract attribute value from an element with null safety.

### Signature

```typescript
function attr(selector: string, attribute: string, options?: AttrOptions): DSLHelper
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `selector` | `string` | Yes | - | CSS selector relative to current element |
| `attribute` | `string` | Yes | - | Attribute name to extract |
| `options` | `AttrOptions` | No | `{}` | Extraction options |
| `options.default` | `any` | No | `null` | Default value if attribute not found |

### Returns

DSL helper object that can be used in schema definitions.

### Examples

```javascript
// Extract href attribute
attr('a', 'href')

// Extract src attribute
attr('img', 'src')

// Extract data attribute with default
attr('div', 'data-id', { default: '0' })

// Extract from current element
attr('', 'title')
```

### Usage in Schema

```javascript
await harvester.harvest(url, '.product', {
  link: attr('a', 'href'),
  image: attr('img', 'src'),
  productId: attr('', 'data-product-id', { default: '0' })
})
```

---

## array()

Extract an array of elements, applying an extractor to each element.

### Signature

```typescript
function array(selector: string, extractor: DSLHelper | Object | Function): DSLHelper
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selector` | `string` | Yes | CSS selector for array items |
| `extractor` | `DSLHelper \| Object \| Function` | Yes | Extractor for each array item |

The `extractor` parameter can be:
- **DSL helper**: Apply a single DSL helper to each element
- **Object**: Apply an object schema to each element
- **Function**: Apply a custom function to each element

### Returns

DSL helper object that can be used in schema definitions.

### Examples

```javascript
// Array of text values
array('.tag', text())

// Array of attributes
array('.link', attr('', 'href'))

// Array of objects
array('.comment', {
  author: text('.author'),
  message: text('.message'),
  date: text('.date')
})

// Array with custom function
array('.item', (el) => el.textContent?.trim())

// Nested arrays
array('.category', {
  name: text('.category-name'),
  items: array('.item', text('.item-name'))
})
```

### Usage in Schema

```javascript
await harvester.harvest(url, '.post', {
  tags: array('.tag', text()),
  images: array('img', attr('', 'src')),
  comments: array('.comment', {
    author: text('.author'),
    text: text('.text')
  })
})
```

---

## exists()

Check if an element exists, returning a boolean value.

### Signature

```typescript
function exists(selector?: string): DSLHelper
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `selector` | `string` | No | - | CSS selector to check. Omit to check current element. |

### Returns

DSL helper object that returns `true` if element exists, `false` otherwise.

### Examples

```javascript
// Check if element exists
exists('.premium-badge')

// Check current element
exists()

// Use in conditions (extract to check later)
exists('.out-of-stock')
```

### Usage in Schema

```javascript
await harvester.harvest(url, '.product', {
  title: text('.title'),
  inStock: exists('.in-stock'),
  featured: exists('.featured-badge'),
  hasDiscount: exists('.discount')
})
```

---

## html()

Extract HTML content (innerHTML) from an element.

### Signature

```typescript
function html(selector?: string, options?: HtmlOptions): DSLHelper
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `selector` | `string` | No | - | CSS selector relative to current element. Omit to use current element. |
| `options` | `HtmlOptions` | No | `{}` | Extraction options |
| `options.default` | `any` | No | `null` | Default value if element not found |

### Returns

DSL helper object that can be used in schema definitions.

### Examples

```javascript
// Extract HTML content
html('.content')

// Extract from current element
html()

// With default value
html('.description', { default: '<p>No content</p>' })
```

### Usage in Schema

```javascript
await harvester.harvest(url, '.article', {
  title: text('.title'),
  body: html('.article-body'),
  summary: html('.summary', { default: '' })
})
```

---

## count()

Count the number of elements matching a selector.

### Signature

```typescript
function count(selector: string): DSLHelper
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selector` | `string` | Yes | CSS selector to count |

### Returns

DSL helper object that returns the number of matching elements (0 if none found).

### Examples

```javascript
// Count elements
count('.item')

// Count reviews
count('.review')

// Count images
count('img')
```

### Usage in Schema

```javascript
await harvester.harvest(url, '.product', {
  title: text('.title'),
  reviewCount: count('.review'),
  imageCount: count('.gallery img'),
  tagCount: count('.tag')
})
```

---

## Schema Composition

### Nested Objects

Create nested object structures by nesting plain objects:

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

### Arrays of Objects

Combine `array()` with object schemas:

```javascript
{
  reviews: array('.review', {
    author: text('.author'),
    rating: count('.star.filled'),
    comment: text('.comment'),
    helpful: count('.helpful-vote')
  })
}
```

### Mixed Mode

Combine DSL helpers with custom functions:

```javascript
{
  // DSL helpers
  title: text('.title'),
  price: text('.price'),

  // Custom function
  priceNumber: (el) => {
    const text = el.querySelector('.price')?.textContent
    return parseFloat(text?.replace(/[^0-9.]/g, '')) || 0
  }
}
```

---

## Advanced Patterns

### Conditional Extraction

Use `exists()` to check conditions:

```javascript
{
  title: text('.title'),
  hasDiscount: exists('.discount-badge'),
  discountAmount: text('.discount-amount', { default: '0%' })
}
```

### Complex Nested Arrays

```javascript
{
  categories: array('.category', {
    name: text('.category-name'),
    products: array('.product', {
      name: text('.product-name'),
      price: text('.price'),
      reviews: array('.review', {
        author: text('.author'),
        rating: count('.star')
      })
    })
  })
}
```

### Reusable Schemas

Define reusable schema fragments:

```javascript
const authorSchema = {
  name: text('.author-name'),
  avatar: attr('.avatar', 'src'),
  verified: exists('.verified-badge')
}

const commentSchema = {
  author: authorSchema,
  text: text('.comment-text'),
  date: text('.date')
}

// Use in harvest
await harvester.harvest(url, '.post', {
  title: text('.title'),
  author: authorSchema,
  comments: array('.comment', commentSchema)
})
```

---

## Type Definitions

For TypeScript users:

```typescript
interface DSLHelper {
  __dsl: string
  selector?: string
  [key: string]: any
}

interface TextOptions {
  trim?: boolean
  default?: any
}

interface AttrOptions {
  default?: any
}

interface HtmlOptions {
  default?: any
}
```

---

## Performance Considerations

### Pure DSL (Optimized)

When using only DSL helpers, extraction is optimized with browser-side execution:

```javascript
// Runs entirely in browser - fastest
{
  title: text('.title'),
  price: text('.price'),
  tags: array('.tag', text())
}
```

### Mixed Mode (Node.js Side)

When mixing DSL with custom functions, execution happens on Node.js side:

```javascript
// Runs on Node.js side - still fast
{
  title: text('.title'),
  custom: (el) => el.dataset.id
}
```

Both approaches are performant. Pure DSL has a slight edge for large-scale extractions.

---

## Error Handling

DSL helpers provide built-in null safety:

- Missing elements return `default` value or `null`
- `count()` returns `0` for no matches
- `exists()` returns `false` for missing elements
- `array()` returns empty array `[]` for no matches

```javascript
{
  // These won't throw errors even if elements are missing
  title: text('.title', { default: 'Untitled' }),
  count: count('.item'),  // Returns 0 if none found
  hasFeature: exists('.feature'),  // Returns false if not found
  items: array('.item', text())  // Returns [] if none found
}
```

---

## See Also

- [DSL Guide](/guide/dsl) - Comprehensive guide to using DSL
- [Examples](/guide/examples) - Practical DSL usage examples
- [Harvester API](/api/harvester) - Core DOMHarvester methods

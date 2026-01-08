# Quick Start

This guide covers the most common use cases to get you productive with DOMHarvest quickly.

## Simple One-off Harvest

For quick, one-time scraping tasks, use the `harvest` function:

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

## Reusable Harvester Instance

When you need to scrape multiple pages, create a harvester instance to reuse the browser:

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })

try {
  await harvester.init()

  // Extract books from books.toscrape.com (a practice scraping site)
  const books = await harvester.harvest(
    'https://books.toscrape.com/',
    '.product_pod',
    (el) => ({
      title: el.querySelector('h3 a')?.getAttribute('title'),
      price: el.querySelector('.price_color')?.textContent?.trim(),
      availability: el.querySelector('.availability')?.textContent?.trim(),
      rating: el.querySelector('.star-rating')?.className.split(' ')[1]
    })
  )

  console.log(books)
} finally {
  await harvester.close()
}
```

## Custom Page Evaluation

For complex extraction logic, use `harvestCustom`:

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester()
await harvester.init()

const pageData = await harvester.harvestCustom(
  'https://quotes.toscrape.com/',
  () => {
    // This runs in the browser context
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
      )),
      hasNextPage: document.querySelector('.next') !== null
    }
  }
)

await harvester.close()
console.log(pageData)
```

## Configuration Options

Customize the harvester behavior:

```javascript
const harvester = new DOMHarvester({
  headless: true,      // Run browser in headless mode
  timeout: 30000       // 30 second timeout for navigation and selectors
})
```

## Error Handling

Always handle errors when scraping:

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester()

try {
  await harvester.init()

  const data = await harvester.harvest(
    'https://example.com',
    '.some-selector',
    (el) => ({ text: el.textContent })
  )

  console.log('Success:', data)
} catch (error) {
  console.error('Scraping failed:', error.message)
} finally {
  await harvester.close()
}
```

## Best Practices

1. **Always close the harvester**: Use try/finally to ensure cleanup
2. **Reuse instances**: Create one harvester for multiple pages
3. **Handle timeouts**: Set appropriate timeouts for slow pages
4. **Respect robots.txt**: Check if scraping is allowed
5. **Add delays**: Don't overwhelm servers with rapid requests

## Next Steps

- See more [Examples](/guide/examples) for common scenarios
- Learn about [Configuration](/guide/configuration) options
- Explore the [API Reference](/api/harvester) for detailed documentation

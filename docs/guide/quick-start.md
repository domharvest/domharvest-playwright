# Quick Start

This guide covers the most common use cases to get you productive with DOMHarvest quickly.

## Simple One-off Harvest

For quick, one-time scraping tasks, use the `harvest` function:

```javascript
import { harvest } from 'domharvest-playwright'

const links = await harvest(
  'https://news.ycombinator.com',
  'a.titlelink',
  (el) => ({
    title: el.textContent?.trim(),
    url: el.href
  })
)

console.log(links)
```

## Reusable Harvester Instance

When you need to scrape multiple pages, create a harvester instance to reuse the browser:

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })

try {
  await harvester.init()

  // Scrape multiple pages
  const page1Data = await harvester.harvest(
    'https://example.com/page1',
    '.article',
    (el) => ({ title: el.querySelector('h2')?.textContent })
  )

  const page2Data = await harvester.harvest(
    'https://example.com/page2',
    '.product',
    (el) => ({ name: el.querySelector('.name')?.textContent })
  )

  console.log({ page1Data, page2Data })
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

const pageInfo = await harvester.harvestCustom(
  'https://example.com',
  () => {
    // This runs in the browser context
    return {
      title: document.title,
      meta: {
        description: document.querySelector('meta[name="description"]')?.content,
        keywords: document.querySelector('meta[name="keywords"]')?.content
      },
      stats: {
        images: document.querySelectorAll('img').length,
        links: document.querySelectorAll('a').length,
        paragraphs: document.querySelectorAll('p').length
      },
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        level: h.tagName.toLowerCase(),
        text: h.textContent?.trim()
      }))
    }
  }
)

await harvester.close()
console.log(pageInfo)
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

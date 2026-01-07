# Examples

Practical examples for common web scraping scenarios.

## Extract Article Titles and Links

```javascript
import { harvest } from 'domharvest-playwright'

const articles = await harvest(
  'https://blog.example.com',
  'article',
  (el) => ({
    title: el.querySelector('h2')?.textContent?.trim(),
    link: el.querySelector('a')?.href,
    excerpt: el.querySelector('.excerpt')?.textContent?.trim(),
    author: el.querySelector('.author')?.textContent?.trim(),
    date: el.querySelector('time')?.getAttribute('datetime')
  })
)

console.log(articles)
```

## Scrape Product Information

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })
await harvester.init()

const products = await harvester.harvest(
  'https://shop.example.com/products',
  '.product-card',
  (el) => ({
    name: el.querySelector('.product-name')?.textContent?.trim(),
    price: parseFloat(
      el.querySelector('.price')?.textContent?.replace(/[^0-9.]/g, '') || '0'
    ),
    image: el.querySelector('img')?.src,
    rating: parseFloat(el.querySelector('.rating')?.textContent || '0'),
    inStock: !el.querySelector('.out-of-stock')
  })
)

await harvester.close()
console.log(products)
```

## Monitor Website Changes

```javascript
import { DOMHarvester } from 'domharvest-playwright'

async function checkForChanges (url, selector) {
  const harvester = new DOMHarvester()
  await harvester.init()

  try {
    const currentContent = await harvester.harvestCustom(url, () => {
      const el = document.querySelector(selector)
      return el ? el.textContent?.trim() : null
    })

    return currentContent
  } finally {
    await harvester.close()
  }
}

// Check every 5 minutes
setInterval(async () => {
  const content = await checkForChanges(
    'https://example.com',
    '#important-section'
  )
  console.log('Current content:', content)
}, 5 * 60 * 1000)
```

## Extract Structured Data

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester()
await harvester.init()

const structuredData = await harvester.harvestCustom(
  'https://example.com',
  () => {
    // Extract JSON-LD structured data
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    )

    return scripts.map(script => {
      try {
        return JSON.parse(script.textContent || '{}')
      } catch {
        return null
      }
    }).filter(Boolean)
  }
)

await harvester.close()
console.log(structuredData)
```

## Scrape Paginated Content

```javascript
import { DOMHarvester } from 'domharvest-playwright'

async function scrapePaginatedContent (baseUrl, maxPages = 5) {
  const harvester = new DOMHarvester()
  await harvester.init()

  const allData = []

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `${baseUrl}?page=${page}`
      console.log(`Scraping page ${page}...`)

      const pageData = await harvester.harvest(
        url,
        '.item',
        (el) => ({
          title: el.querySelector('h3')?.textContent?.trim()
        })
      )

      allData.push(...pageData)

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } finally {
    await harvester.close()
  }

  return allData
}

const data = await scrapePaginatedContent('https://example.com/items', 3)
console.log(`Scraped ${data.length} items`)
```

## Extract Table Data

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester()
await harvester.init()

const tableData = await harvester.harvestCustom(
  'https://example.com/table',
  () => {
    const table = document.querySelector('table')
    if (!table) return []

    const headers = Array.from(table.querySelectorAll('th')).map(
      th => th.textContent?.trim()
    )

    const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
      const cells = Array.from(tr.querySelectorAll('td')).map(
        td => td.textContent?.trim()
      )

      return headers.reduce((obj, header, index) => {
        obj[header] = cells[index]
        return obj
      }, {})
    })

    return rows
  }
)

await harvester.close()
console.log(tableData)
```

## Save to File

```javascript
import { harvest } from 'domharvest-playwright'
import { writeFile } from 'fs/promises'

const data = await harvest(
  'https://example.com',
  '.news-item',
  (el) => ({
    headline: el.querySelector('h2')?.textContent?.trim(),
    timestamp: new Date().toISOString()
  })
)

await writeFile(
  'scraped-data.json',
  JSON.stringify(data, null, 2),
  'utf-8'
)

console.log('Data saved to scraped-data.json')
```

## Run Examples

All these examples and more are available in the repository:

```bash
git clone https://github.com/domharvest/domharvest-playwright.git
cd domharvest-playwright
npm install
node examples/basic-example.js
```

## Next Steps

- Learn about [Configuration](/guide/configuration) options
- Check the [API Reference](/api/harvester) for detailed documentation

# Examples

Practical examples for common web scraping scenarios using real practice websites.

## Extract Quotes with Authors and Tags

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
// Output: Array of 10 quotes with authors and tags
```

## Scrape Book Information

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })
await harvester.init()

const books = await harvester.harvest(
  'https://books.toscrape.com/',
  '.product_pod',
  (el) => ({
    title: el.querySelector('h3 a')?.getAttribute('title'),
    price: el.querySelector('.price_color')?.textContent?.trim(),
    availability: el.querySelector('.availability')?.textContent?.trim(),
    rating: el.querySelector('.star-rating')?.className.split(' ')[1],
    image: el.querySelector('img')?.src
  })
)

await harvester.close()
console.log(books)
// Output: Array of 20 books with details
```

## Extract Page Metadata

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester()
await harvester.init()

const pageData = await harvester.harvestCustom(
  'https://quotes.toscrape.com/',
  () => {
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

## Scrape Paginated Content

```javascript
import { DOMHarvester } from 'domharvest-playwright'

async function scrapeMultiplePages (maxPages = 3) {
  const harvester = new DOMHarvester()
  await harvester.init()

  const allQuotes = []

  try {
    for (let page = 1; page <= maxPages; page++) {
      console.log(`Scraping page ${page}...`)

      const quotes = await harvester.harvest(
        `https://quotes.toscrape.com/page/${page}/`,
        '.quote',
        (el) => ({
          text: el.querySelector('.text')?.textContent?.trim(),
          author: el.querySelector('.author')?.textContent?.trim()
        })
      )

      allQuotes.push(...quotes)

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } finally {
    await harvester.close()
  }

  return allQuotes
}

const quotes = await scrapeMultiplePages(3)
console.log(`Total quotes: ${quotes.length}`)
// Output: 30 quotes from 3 pages
```

## Filter and Transform Data

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester()
await harvester.init()

const books = await harvester.harvest(
  'https://books.toscrape.com/',
  '.product_pod',
  (el) => ({
    title: el.querySelector('h3 a')?.getAttribute('title'),
    price: parseFloat(
      el.querySelector('.price_color')?.textContent?.replace(/[^0-9.]/g, '') || '0'
    ),
    rating: el.querySelector('.star-rating')?.className.split(' ')[1],
    inStock: el.querySelector('.availability')?.textContent?.includes('In stock')
  })
)

// Filter only books in stock with 4+ star rating
const topBooks = books.filter(book =>
  book.inStock &&
  ['Four', 'Five'].includes(book.rating)
)

// Sort by price (descending)
topBooks.sort((a, b) => b.price - a.price)

await harvester.close()
console.log('Top rated books in stock:', topBooks)
```

## Extract Table Data

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester()
await harvester.init()

const tableData = await harvester.harvestCustom(
  'https://quotes.toscrape.com/tableful/',
  () => {
    const rows = Array.from(document.querySelectorAll('.table-responsive table tbody tr'))

    return rows.map(tr => {
      const cells = Array.from(tr.querySelectorAll('td'))
      return {
        quote: cells[0]?.textContent?.trim(),
        author: cells[1]?.textContent?.trim(),
        tags: cells[2]?.textContent?.trim()
      }
    })
  }
)

await harvester.close()
console.log(tableData)
```

## Extract with Wait Conditions

```javascript
import { DOMHarvester } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })
await harvester.init()

try {
  // Navigate to page
  await harvester.page.goto('https://quotes.toscrape.com/scroll')

  // Wait for specific content to load
  await harvester.page.waitForSelector('.quote', { timeout: 5000 })

  // Scroll to load more content
  await harvester.page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight)
  })

  // Wait a bit for new content
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Extract all quotes
  const quotes = await harvester.page.$$eval('.quote', quotes =>
    quotes.map(quote => ({
      text: quote.querySelector('.text')?.textContent?.trim(),
      author: quote.querySelector('.author')?.textContent?.trim()
    }))
  )

  console.log(`Extracted ${quotes.length} quotes`)
} finally {
  await harvester.close()
}
```

## Save to File

```javascript
import { harvest } from 'domharvest-playwright'
import { writeFile } from 'fs/promises'

const quotes = await harvest(
  'https://quotes.toscrape.com/',
  '.quote',
  (el) => ({
    text: el.querySelector('.text')?.textContent?.trim(),
    author: el.querySelector('.author')?.textContent?.trim(),
    tags: Array.from(el.querySelectorAll('.tag')).map(tag => tag.textContent?.trim()),
    timestamp: new Date().toISOString()
  })
)

// Save as JSON
await writeFile(
  'quotes.json',
  JSON.stringify(quotes, null, 2),
  'utf-8'
)

// Save as CSV
const csv = [
  'text,author,tags',
  ...quotes.map(q => `"${q.text}","${q.author}","${q.tags.join('; ')}"`)
].join('\n')

await writeFile('quotes.csv', csv, 'utf-8')

console.log(`Saved ${quotes.length} quotes to files`)
```

## Run Examples

All these examples and more are available in the repository:

```bash
git clone https://github.com/domharvest/domharvest-playwright.git
cd domharvest-playwright
npm install
npm run playwright:install
node examples/basic-example.js
```

## Practice Websites

These examples use the following practice websites that are specifically designed for web scraping:

- **quotes.toscrape.com** - Quote collection with pagination, tags, and various layouts
- **books.toscrape.com** - Fictional bookstore with products, ratings, and categories

These sites are perfect for learning and testing scraping techniques without violating any Terms of Service.

## Next Steps

- Learn about [Configuration](/guide/configuration) options
- Check the [API Reference](/api/harvester) for detailed documentation

import { DOMHarvester, harvest } from '../src/harvester.js'

/**
 * Example 1: Simple one-off harvest using the convenience function
 * Extract all quotes from quotes.toscrape.com (a site designed for scraping practice)
 */
async function simpleExample () {
  console.log('\n=== Simple Example: Extracting Quotes ===')

  const results = await harvest(
    'https://quotes.toscrape.com/',
    '.quote',
    (el) => ({
      text: el.querySelector('.text')?.textContent?.trim(),
      author: el.querySelector('.author')?.textContent?.trim(),
      tags: Array.from(el.querySelectorAll('.tag')).map(tag => tag.textContent?.trim())
    })
  )

  console.log('Quotes found:', results.length)
  console.log('First quote:', results[0])
  console.log('All quotes:', results)
}

/**
 * Example 2: Reusable harvester instance for multiple operations
 * Extract book information from books.toscrape.com
 */
async function reusableHarvesterExample () {
  console.log('\n=== Reusable Harvester Example: Extracting Books ===')

  const harvester = new DOMHarvester({ headless: true })

  try {
    await harvester.init()

    // Extract all books from books.toscrape.com
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

    console.log('Books found:', books.length)
    console.log('First book:', books[0])
    console.log('All books:', books)
  } finally {
    await harvester.close()
  }
}

/**
 * Example 3: Custom extraction logic using harvestCustom
 * Extract page metadata and structure from quotes.toscrape.com
 */
async function customExtractionExample () {
  console.log('\n=== Custom Extraction Example: Page Metadata ===')

  const harvester = new DOMHarvester({ headless: true })

  try {
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

    console.log('Page data:', pageData)
  } finally {
    await harvester.close()
  }
}

/**
 * Example 4: Advanced extraction - Multiple pages
 * Navigate and extract from multiple pages
 */
async function multiPageExample () {
  console.log('\n=== Multi-Page Example: Extracting from Multiple Pages ===')

  const harvester = new DOMHarvester({ headless: true })

  try {
    await harvester.init()

    const allQuotes = []
    let currentPage = 1
    const maxPages = 3 // Limit to 3 pages for this example

    while (currentPage <= maxPages) {
      console.log(`\nExtracting page ${currentPage}...`)

      const quotes = await harvester.harvest(
        `https://quotes.toscrape.com/page/${currentPage}/`,
        '.quote',
        (el) => ({
          text: el.querySelector('.text')?.textContent?.trim(),
          author: el.querySelector('.author')?.textContent?.trim()
        })
      )

      allQuotes.push(...quotes)
      currentPage++
    }

    console.log(`\nTotal quotes extracted from ${maxPages} pages:`, allQuotes.length)
    console.log('Sample quotes:', allQuotes.slice(0, 3))
  } finally {
    await harvester.close()
  }
}

/**
 * Run all examples
 */
async function main () {
  try {
    await simpleExample()
    await reusableHarvesterExample()
    await customExtractionExample()
    await multiPageExample()

    console.log('\n✅ All examples completed successfully!')
  } catch (error) {
    console.error('❌ Error running examples:', error)
    process.exit(1)
  }
}

// Run examples if this file is executed directly
main()

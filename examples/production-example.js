/**
 * Production-Ready Example
 *
 * This example demonstrates all advanced features of domharvest-playwright:
 * - Retry logic with exponential backoff
 * - Rate limiting
 * - Batch processing with concurrency control
 * - Structured logging
 * - Enhanced error handling
 */

import { DOMHarvester, TimeoutError, NavigationError, ExtractionError } from '../src/harvester.js'

async function main () {
  // Configure harvester with production-ready options
  const harvester = new DOMHarvester({
    headless: true,
    timeout: 30000,

    // Rate limiting: 10 requests per minute
    rateLimit: {
      requests: 10,
      per: 60000
    },

    // Structured logging
    logging: {
      level: 'info' // Change to 'debug' for more verbose output
    },

    // Error callback for centralized error handling
    onError: (error, context) => {
      console.error('\n❌ Error occurred:')
      console.error(`   URL: ${context.url}`)
      console.error(`   Error: ${error.name} - ${error.message}`)
      if (context.duration) {
        console.error(`   Duration: ${context.duration}`)
      }
    }
  })

  try {
    await harvester.init()
    console.log('🚀 Browser initialized successfully\n')

    // Example 1: Single page harvest with retry logic
    console.log('📖 Example 1: Harvesting quotes with retry logic...')
    try {
      const quotes = await harvester.harvest(
        'https://quotes.toscrape.com/',
        '.quote',
        (el) => ({
          text: el.querySelector('.text')?.textContent?.trim().replace(/[""]/g, ''),
          author: el.querySelector('.author')?.textContent?.trim(),
          tags: Array.from(el.querySelectorAll('.tag')).map(tag => tag.textContent?.trim())
        }),
        {
          retries: 3,
          backoff: 'exponential',
          maxBackoff: 10000
        }
      )

      console.log(`✅ Successfully extracted ${quotes.length} quotes`)
      console.log(`   First quote: "${quotes[0].text}" - ${quotes[0].author}`)
      console.log()
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.error(`Timeout error: ${error.message}`)
      } else if (error instanceof NavigationError) {
        console.error(`Navigation error: ${error.message}`)
      }
    }

    // Example 2: Batch processing multiple pages
    console.log('📚 Example 2: Batch processing multiple pages...')
    const results = await harvester.harvestBatch([
      {
        url: 'https://quotes.toscrape.com/',
        selector: '.quote',
        extractor: (el) => ({
          author: el.querySelector('.author')?.textContent?.trim()
        }),
        options: { retries: 2 }
      },
      {
        url: 'https://quotes.toscrape.com/page/2/',
        selector: '.quote',
        extractor: (el) => ({
          author: el.querySelector('.author')?.textContent?.trim()
        }),
        options: { retries: 2 }
      },
      {
        url: 'https://books.toscrape.com/',
        selector: '.product_pod',
        extractor: (el) => ({
          title: el.querySelector('h3 a')?.getAttribute('title'),
          price: el.querySelector('.price_color')?.textContent?.trim()
        }),
        options: { retries: 2 }
      }
    ], {
      concurrency: 3,
      onProgress: (completed, total) => {
        console.log(`   Progress: ${completed}/${total} pages completed`)
      }
    })

    // Analyze batch results
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log('\n✅ Batch processing complete:')
    console.log(`   Successful: ${successful.length}`)
    console.log(`   Failed: ${failed.length}`)
    console.log()

    successful.forEach(result => {
      console.log(`   ✓ ${result.url}`)
      console.log(`     Items: ${result.data.length}, Duration: ${result.duration}ms`)
    })

    if (failed.length > 0) {
      console.log('\n   Failed URLs:')
      failed.forEach(result => {
        console.log(`   ✗ ${result.url}`)
        console.log(`     Error: ${result.errorName} - ${result.error}`)
      })
    }

    // Example 3: Custom page function with retry
    console.log('\n🔍 Example 3: Custom page analysis...')
    const pageStats = await harvester.harvestCustom(
      'https://quotes.toscrape.com/',
      () => {
        return {
          title: document.title,
          totalQuotes: document.querySelectorAll('.quote').length,
          uniqueAuthors: new Set(
            Array.from(document.querySelectorAll('.author'))
              .map(a => a.textContent?.trim())
          ).size,
          allTags: new Set(
            Array.from(document.querySelectorAll('.tag'))
              .map(t => t.textContent?.trim())
          ).size
        }
      },
      { retries: 2 }
    )

    console.log('✅ Page statistics:')
    console.log(`   Title: ${pageStats.title}`)
    console.log(`   Quotes: ${pageStats.totalQuotes}`)
    console.log(`   Authors: ${pageStats.uniqueAuthors}`)
    console.log(`   Unique Tags: ${pageStats.allTags}`)

    console.log('\n🎉 All examples completed successfully!')
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message)
    if (error instanceof ExtractionError) {
      console.error(`Extraction failed at ${error.url} using selector ${error.selector}`)
    }
  } finally {
    await harvester.close()
    console.log('\n🔒 Browser closed')
  }
}

// Run the example
main().catch(console.error)

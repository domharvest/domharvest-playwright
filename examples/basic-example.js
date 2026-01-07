import { DOMHarvester, harvest } from '../src/harvester.js'

/**
 * Example 1: Simple one-off harvest using the convenience function
 * Extract all paragraph texts from example.com
 */
async function simpleExample () {
  console.log('\n=== Simple Example ===')

  const results = await harvest(
    'https://example.com',
    'p',
    (el) => ({ text: el.textContent?.trim() })
  )

  console.log('Paragraphs found:', results.length)
  console.log(results)
}

/**
 * Example 2: Reusable harvester instance for multiple operations
 * Extract links from a page
 */
async function reusableHarvesterExample () {
  console.log('\n=== Reusable Harvester Example ===')

  const harvester = new DOMHarvester({ headless: true })

  try {
    await harvester.init()

    // Extract all links from example.com
    const links = await harvester.harvest(
      'https://example.com',
      'a',
      (el) => ({
        text: el.textContent?.trim(),
        href: el.href,
        target: el.target
      })
    )

    console.log('Links found:', links.length)
    console.log(links)
  } finally {
    await harvester.close()
  }
}

/**
 * Example 3: Custom extraction logic using harvestCustom
 * Extract page metadata and structure
 */
async function customExtractionExample () {
  console.log('\n=== Custom Extraction Example ===')

  const harvester = new DOMHarvester({ headless: true })

  try {
    await harvester.init()

    const pageData = await harvester.harvestCustom(
      'https://example.com',
      () => {
        return {
          title: document.title,
          headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
            level: h.tagName.toLowerCase(),
            text: h.textContent?.trim()
          })),
          paragraphCount: document.querySelectorAll('p').length,
          linkCount: document.querySelectorAll('a').length,
          imageCount: document.querySelectorAll('img').length
        }
      }
    )

    console.log('Page data:', pageData)
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

    console.log('\n✅ All examples completed successfully!')
  } catch (error) {
    console.error('❌ Error running examples:', error)
    process.exit(1)
  }
}

// Run examples if this file is executed directly
main()

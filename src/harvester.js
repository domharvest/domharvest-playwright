import { chromium } from 'playwright'

/**
 * DOMHarvester - A simple DOM harvesting tool using Playwright
 */
export class DOMHarvester {
  constructor (options = {}) {
    this.options = {
      headless: true,
      timeout: 30000,
      ...options
    }
    this.browser = null
    this.context = null
  }

  /**
   * Initialize the browser
   */
  async init () {
    this.browser = await chromium.launch({
      headless: this.options.headless
    })
    this.context = await this.browser.newContext()
  }

  /**
   * Close the browser
   */
  async close () {
    if (this.context) await this.context.close()
    if (this.browser) await this.browser.close()
  }

  /**
   * Navigate to a URL and extract data using a selector
   * @param {string} url - The URL to visit
   * @param {string} selector - CSS selector for elements to extract
   * @param {Function} extractor - Optional function to extract data from elements
   * @returns {Promise<Array>} Array of extracted data
   */
  async harvest (url, selector, extractor = null) {
    const page = await this.context.newPage()

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.options.timeout
      })

      // Wait for selector to be present
      await page.waitForSelector(selector, { timeout: this.options.timeout })

      // Extract data
      let results
      if (extractor) {
        // Use custom extractor function
        results = await page.$$eval(selector, (elements, extractorFn) => {
          // eslint-disable-next-line no-new-func
          const fn = new Function('return ' + extractorFn)()
          return elements.map(el => fn(el))
        }, extractor.toString())
      } else {
        // Use default extraction
        results = await page.$$eval(selector, (elements) => {
          return elements.map(el => ({
            text: el.textContent?.trim(),
            html: el.innerHTML,
            tag: el.tagName.toLowerCase()
          }))
        })
      }

      return results
    } finally {
      await page.close()
    }
  }

  /**
   * Navigate to a URL and execute custom extraction logic
   * @param {string} url - The URL to visit
   * @param {Function} pageFunction - Function to execute in page context
   * @returns {Promise<*>} Result of the page function
   */
  async harvestCustom (url, pageFunction) {
    const page = await this.context.newPage()

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.options.timeout
      })

      const result = await page.evaluate(pageFunction)
      return result
    } finally {
      await page.close()
    }
  }
}

/**
 * Convenience function for one-off harvesting
 * @param {string} url - The URL to visit
 * @param {string} selector - CSS selector for elements to extract
 * @param {Function} extractor - Optional function to extract data from elements
 * @param {Object} options - Harvester options
 * @returns {Promise<Array>} Array of extracted data
 */
export async function harvest (url, selector, extractor = null, options = {}) {
  const harvester = new DOMHarvester(options)
  try {
    await harvester.init()
    return await harvester.harvest(url, selector, extractor)
  } finally {
    await harvester.close()
  }
}

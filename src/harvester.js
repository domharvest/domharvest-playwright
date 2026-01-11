import { chromium } from 'playwright'

/**
 * Custom error class for timeout errors
 */
export class TimeoutError extends Error {
  constructor (message, context = {}) {
    super(message)
    this.name = 'TimeoutError'
    this.url = context.url
    this.selector = context.selector
    this.operation = context.operation
    this.cause = context.cause
  }
}

/**
 * Custom error class for navigation errors
 */
export class NavigationError extends Error {
  constructor (message, context = {}) {
    super(message)
    this.name = 'NavigationError'
    this.url = context.url
    this.operation = context.operation || 'navigation'
    this.cause = context.cause
  }
}

/**
 * Custom error class for extraction errors
 */
export class ExtractionError extends Error {
  constructor (message, context = {}) {
    super(message)
    this.name = 'ExtractionError'
    this.url = context.url
    this.selector = context.selector
    this.operation = context.operation || 'extraction'
    this.cause = context.cause
  }
}

/**
 * Internal logger class
 */
class Logger {
  constructor (options = {}) {
    this.level = options.level || 'info'
    this.customLogger = options.logger || null
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 }
  }

  shouldLog (level) {
    return this.levels[level] >= this.levels[this.level]
  }

  formatMessage (level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    const metaStr = Object.keys(meta).length > 0 ? ' ' + JSON.stringify(meta) : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
  }

  debug (message, meta) {
    if (!this.shouldLog('debug')) return
    if (this.customLogger) {
      this.customLogger.debug(message, meta)
    } else {
      console.log(this.formatMessage('debug', message, meta))
    }
  }

  info (message, meta) {
    if (!this.shouldLog('info')) return
    if (this.customLogger) {
      this.customLogger.info(message, meta)
    } else {
      console.log(this.formatMessage('info', message, meta))
    }
  }

  warn (message, meta) {
    if (!this.shouldLog('warn')) return
    if (this.customLogger) {
      this.customLogger.warn(message, meta)
    } else {
      console.warn(this.formatMessage('warn', message, meta))
    }
  }

  error (message, meta) {
    if (!this.shouldLog('error')) return
    if (this.customLogger) {
      this.customLogger.error(message, meta)
    } else {
      console.error(this.formatMessage('error', message, meta))
    }
  }
}

/**
 * Internal rate limiter class using sliding window algorithm
 */
class RateLimiter {
  constructor (config) {
    this.globalLimit = config.global || config
    this.perDomainLimit = config.perDomain || null
    this.globalTimestamps = []
    this.domainTimestamps = new Map()
  }

  extractDomain (url) {
    try {
      return new URL(url).hostname
    } catch {
      return null
    }
  }

  cleanOldTimestamps (timestamps, windowMs) {
    const now = Date.now()
    const cutoff = now - windowMs
    return timestamps.filter(ts => ts > cutoff)
  }

  async waitIfNeeded (url) {
    const now = Date.now()
    const domain = this.extractDomain(url)

    // Check global limit
    if (this.globalLimit) {
      this.globalTimestamps = this.cleanOldTimestamps(this.globalTimestamps, this.globalLimit.per)
      if (this.globalTimestamps.length >= this.globalLimit.requests) {
        const oldestTimestamp = this.globalTimestamps[0]
        const waitTime = oldestTimestamp + this.globalLimit.per - now
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
      this.globalTimestamps.push(Date.now())
    }

    // Check per-domain limit
    if (this.perDomainLimit && domain) {
      if (!this.domainTimestamps.has(domain)) {
        this.domainTimestamps.set(domain, [])
      }
      let domainTs = this.domainTimestamps.get(domain)
      domainTs = this.cleanOldTimestamps(domainTs, this.perDomainLimit.per)
      if (domainTs.length >= this.perDomainLimit.requests) {
        const oldestTimestamp = domainTs[0]
        const waitTime = oldestTimestamp + this.perDomainLimit.per - now
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
      domainTs.push(Date.now())
      this.domainTimestamps.set(domain, domainTs)
    }
  }
}

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
    this.logger = options.logging ? new Logger(options.logging) : null
    this.rateLimiter = options.rateLimit ? new RateLimiter(options.rateLimit) : null
    this.onError = options.onError || null

    // Store context options for browser context creation
    this.contextOptions = this._buildContextOptions(options)
  }

  /**
   * Build browser context options from user configuration
   * @param {Object} options - User options
   * @returns {Object} Playwright context options
   * @private
   */
  _buildContextOptions (options) {
    const contextOptions = {}

    // Proxy configuration
    if (options.proxy) {
      contextOptions.proxy = options.proxy
    }

    // Viewport configuration
    if (options.viewport) {
      contextOptions.viewport = options.viewport
    }

    // User agent
    if (options.userAgent) {
      contextOptions.userAgent = options.userAgent
    }

    // Geolocation
    if (options.geolocation) {
      contextOptions.geolocation = options.geolocation
    }

    // Timezone
    if (options.timezoneId) {
      contextOptions.timezoneId = options.timezoneId
    }

    // Locale
    if (options.locale) {
      contextOptions.locale = options.locale
    }

    // Extra HTTP headers
    if (options.extraHTTPHeaders) {
      contextOptions.extraHTTPHeaders = options.extraHTTPHeaders
    }

    // JavaScript enabled/disabled
    if (options.javaScriptEnabled !== undefined) {
      contextOptions.javaScriptEnabled = options.javaScriptEnabled
    }

    return contextOptions
  }

  /**
   * Initialize the browser
   */
  async init () {
    try {
      this.logger?.debug('Initializing browser')
      this.browser = await chromium.launch({
        headless: this.options.headless
      })
      this.context = await this.browser.newContext(this.contextOptions)

      // Set cookies if provided
      if (this.options.cookies) {
        await this.context.addCookies(this.options.cookies)
        this.logger?.debug('Cookies added', { count: this.options.cookies.length })
      }

      this.logger?.info('Browser initialized successfully')
    } catch (error) {
      const wrappedError = new NavigationError(
        `Failed to initialize browser: ${error.message}`,
        { operation: 'initialization', cause: error }
      )
      this.handleError(wrappedError, { operation: 'initialization' })
      throw wrappedError
    }
  }

  /**
   * Internal method to handle errors
   * @param {Error} error - The error to handle
   * @param {Object} context - Additional context
   */
  handleError (error, context = {}) {
    this.logger?.error(error.message, { ...context, error: error.name })
    if (this.onError) {
      this.onError(error, { ...context, timestamp: new Date().toISOString() })
    }
  }

  /**
   * Calculate backoff delay based on strategy
   * @param {number} attempt - Current attempt number (0-indexed)
   * @param {string} strategy - 'exponential' or 'linear'
   * @param {number} maxBackoff - Maximum backoff in ms
   * @returns {number} Delay in milliseconds
   */
  calculateBackoff (attempt, strategy = 'exponential', maxBackoff = 10000) {
    if (strategy === 'linear') {
      return Math.min(1000 * (attempt + 1), maxBackoff)
    }
    // Exponential: 1s, 2s, 4s, 8s, etc.
    return Math.min(1000 * Math.pow(2, attempt), maxBackoff)
  }

  /**
   * Check if error should be retried
   * @param {Error} error - The error to check
   * @param {Array<string>} retryOn - List of error names to retry on
   * @returns {boolean} Whether to retry
   */
  shouldRetry (error, retryOn = null) {
    if (!retryOn) return true
    return retryOn.includes(error.name)
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
   * @param {Object} options - Operation options (retries, backoff, etc.)
   * @returns {Promise<Array>} Array of extracted data
   */
  async harvest (url, selector, extractor = null, options = {}) {
    const {
      retries = 0,
      backoff = 'exponential',
      maxBackoff = 10000,
      retryOn = null,
      screenshot = null,
      waitForLoadState = 'domcontentloaded',
      waitForSelector = {}
    } = options

    // Apply rate limiting if configured
    if (this.rateLimiter) {
      await this.rateLimiter.waitIfNeeded(url)
    }

    let lastError = null
    const startTime = Date.now()

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.calculateBackoff(attempt - 1, backoff, maxBackoff)
          this.logger?.info(`Retrying request (attempt ${attempt + 1}/${retries + 1})`, {
            url,
            delay: `${delay}ms`
          })
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        this.logger?.debug('Starting navigation', { url, attempt: attempt + 1 })
        const result = await this._performHarvest(url, selector, extractor, {
          screenshot,
          waitForLoadState,
          waitForSelector
        })
        const duration = Date.now() - startTime
        this.logger?.info('Harvest completed successfully', { url, duration: `${duration}ms`, itemCount: result.length })
        return result
      } catch (error) {
        lastError = error
        const shouldRetryError = this.shouldRetry(error, retryOn)

        if (attempt < retries && shouldRetryError) {
          this.logger?.warn('Harvest attempt failed, will retry', {
            url,
            attempt: attempt + 1,
            error: error.name,
            message: error.message
          })
        } else {
          break
        }
      }
    }

    // All retries exhausted
    const duration = Date.now() - startTime
    this.handleError(lastError, { url, selector, duration: `${duration}ms` })
    throw lastError
  }

  /**
   * Internal method to perform the actual harvest operation
   * @param {string} url - The URL to visit
   * @param {string} selector - CSS selector for elements to extract
   * @param {Function} extractor - Optional function to extract data from elements
   * @param {Object} options - Additional options (screenshot, waitForLoadState, etc.)
   * @returns {Promise<Array>} Array of extracted data
   * @private
   */
  async _performHarvest (url, selector, extractor = null, options = {}) {
    const {
      screenshot = null,
      waitForLoadState = 'domcontentloaded',
      waitForSelector = {}
    } = options

    const page = await this.context.newPage()

    try {
      // Navigation phase
      try {
        await page.goto(url, {
          waitUntil: waitForLoadState,
          timeout: this.options.timeout
        })
      } catch (error) {
        throw new NavigationError(
          `Failed to navigate to ${url}: ${error.message}`,
          { url, operation: 'navigation', cause: error }
        )
      }

      // Wait for selector with custom options
      try {
        const selectorOptions = {
          timeout: this.options.timeout,
          ...waitForSelector
        }
        await page.waitForSelector(selector, selectorOptions)
      } catch (error) {
        throw new TimeoutError(
          `Timeout waiting for selector "${selector}" on ${url}`,
          { url, selector, operation: 'navigation', cause: error }
        )
      }

      // Take screenshot if requested
      if (screenshot) {
        try {
          await page.screenshot(screenshot)
          this.logger?.debug('Screenshot captured', screenshot)
        } catch (error) {
          this.logger?.warn('Failed to capture screenshot', { error: error.message })
        }
      }

      // Extraction phase
      try {
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

        this.logger?.debug('Extraction completed', { selector, count: results.length })
        return results
      } catch (error) {
        throw new ExtractionError(
          `Failed to extract data using selector "${selector}": ${error.message}`,
          { url, selector, operation: 'extraction', cause: error }
        )
      }
    } finally {
      await page.close()
    }
  }

  /**
   * Navigate to a URL and execute custom extraction logic
   * @param {string} url - The URL to visit
   * @param {Function} pageFunction - Function to execute in page context
   * @param {Object} options - Operation options (retries, backoff, etc.)
   * @returns {Promise<*>} Result of the page function
   */
  async harvestCustom (url, pageFunction, options = {}) {
    const {
      retries = 0,
      backoff = 'exponential',
      maxBackoff = 10000,
      retryOn = null,
      screenshot = null,
      waitForLoadState = 'domcontentloaded'
    } = options

    // Apply rate limiting if configured
    if (this.rateLimiter) {
      await this.rateLimiter.waitIfNeeded(url)
    }

    let lastError = null
    const startTime = Date.now()

    for (let attempt = 0; attempt <= retries; attempt++) {
      const page = await this.context.newPage()

      try {
        if (attempt > 0) {
          const delay = this.calculateBackoff(attempt - 1, backoff, maxBackoff)
          this.logger?.info(`Retrying custom harvest (attempt ${attempt + 1}/${retries + 1})`, {
            url,
            delay: `${delay}ms`
          })
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        this.logger?.debug('Starting custom harvest', { url, attempt: attempt + 1 })

        try {
          await page.goto(url, {
            waitUntil: waitForLoadState,
            timeout: this.options.timeout
          })
        } catch (error) {
          throw new NavigationError(
            `Failed to navigate to ${url}: ${error.message}`,
            { url, operation: 'navigation', cause: error }
          )
        }

        // Take screenshot if requested
        if (screenshot) {
          try {
            await page.screenshot(screenshot)
            this.logger?.debug('Screenshot captured', screenshot)
          } catch (error) {
            this.logger?.warn('Failed to capture screenshot', { error: error.message })
          }
        }

        const result = await page.evaluate(pageFunction)
        const duration = Date.now() - startTime
        this.logger?.info('Custom harvest completed successfully', { url, duration: `${duration}ms` })
        await page.close()
        return result
      } catch (error) {
        await page.close()
        lastError = error
        const shouldRetryError = this.shouldRetry(error, retryOn)

        if (attempt < retries && shouldRetryError) {
          this.logger?.warn('Custom harvest attempt failed, will retry', {
            url,
            attempt: attempt + 1,
            error: error.name
          })
        } else {
          break
        }
      }
    }

    // All retries exhausted
    const duration = Date.now() - startTime
    this.handleError(lastError, { url, duration: `${duration}ms` })
    throw lastError
  }

  /**
   * Take a screenshot of a page
   * @param {string} url - The URL to visit
   * @param {Object} screenshotOptions - Screenshot options (path, fullPage, etc.)
   * @param {Object} options - Navigation options
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async screenshot (url, screenshotOptions = {}, options = {}) {
    const { waitForLoadState = 'domcontentloaded', waitForSelector = null } = options

    // Apply rate limiting if configured
    if (this.rateLimiter) {
      await this.rateLimiter.waitIfNeeded(url)
    }

    const page = await this.context.newPage()

    try {
      this.logger?.debug('Navigating for screenshot', { url })

      await page.goto(url, {
        waitUntil: waitForLoadState,
        timeout: this.options.timeout
      })

      // Wait for specific selector if provided
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: this.options.timeout })
      }

      const screenshot = await page.screenshot(screenshotOptions)
      this.logger?.info('Screenshot captured', { url, ...screenshotOptions })

      return screenshot
    } catch (error) {
      const wrappedError = new NavigationError(
        `Failed to capture screenshot: ${error.message}`,
        { url, operation: 'screenshot', cause: error }
      )
      this.handleError(wrappedError, { url, operation: 'screenshot' })
      throw wrappedError
    } finally {
      await page.close()
    }
  }

  /**
   * Harvest multiple URLs in batch with concurrency control
   * @param {Array<Object>} configs - Array of harvest configurations
   * @param {Object} options - Batch options (concurrency, onProgress, etc.)
   * @returns {Promise<Array>} Array of results with success/error status
   */
  async harvestBatch (configs, options = {}) {
    const {
      concurrency = 5,
      onProgress = null
    } = options

    const results = []
    let completed = 0
    const total = configs.length

    this.logger?.info('Starting batch harvest', { total, concurrency })

    // Process in chunks
    for (let i = 0; i < configs.length; i += concurrency) {
      const chunk = configs.slice(i, i + concurrency)
      const chunkPromises = chunk.map(async (config) => {
        const startTime = Date.now()
        try {
          const data = await this.harvest(
            config.url,
            config.selector,
            config.extractor,
            config.options || {}
          )
          const duration = Date.now() - startTime
          completed++
          if (onProgress) onProgress(completed, total)
          return { success: true, data, url: config.url, duration }
        } catch (error) {
          const duration = Date.now() - startTime
          completed++
          if (onProgress) onProgress(completed, total)
          return {
            success: false,
            error: error.message,
            errorName: error.name,
            url: config.url,
            duration
          }
        }
      })

      const chunkResults = await Promise.all(chunkPromises)
      results.push(...chunkResults)
    }

    const successCount = results.filter(r => r.success).length
    this.logger?.info('Batch harvest completed', {
      total,
      successful: successCount,
      failed: total - successCount
    })

    return results
  }
}

/**
 * Convenience function for one-off harvesting
 * @param {string} url - The URL to visit
 * @param {string} selector - CSS selector for elements to extract
 * @param {Function} extractor - Optional function to extract data from elements
 * @param {Object} options - Harvester and operation options
 * @returns {Promise<Array>} Array of extracted data
 */
export async function harvest (url, selector, extractor = null, options = {}) {
  // Separate harvester options from operation options
  const { retries, backoff, maxBackoff, retryOn, ...harvesterOptions } = options
  const operationOptions = { retries, backoff, maxBackoff, retryOn }

  const harvester = new DOMHarvester(harvesterOptions)
  try {
    await harvester.init()
    return await harvester.harvest(url, selector, extractor, operationOptions)
  } finally {
    await harvester.close()
  }
}

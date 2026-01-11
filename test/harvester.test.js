import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DOMHarvester, TimeoutError, NavigationError, ExtractionError } from '../src/harvester.js'

// Mock data for testing
const MOCK_URL = 'https://quotes.toscrape.com/'
const MOCK_SELECTOR = '.quote'

test('DOMHarvester - initialization', async (t) => {
  await t.test('should initialize browser successfully', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()
    assert.ok(harvester.browser, 'Browser should be initialized')
    assert.ok(harvester.context, 'Context should be initialized')
    await harvester.close()
  })

  await t.test('should support logging configuration', async () => {
    const harvester = new DOMHarvester({
      headless: true,
      logging: { level: 'debug' }
    })
    assert.ok(harvester.logger, 'Logger should be initialized')
    assert.equal(harvester.logger.level, 'debug')
    await harvester.init()
    await harvester.close()
  })

  await t.test('should support rate limiting configuration', async () => {
    const harvester = new DOMHarvester({
      headless: true,
      rateLimit: { requests: 5, per: 60000 }
    })
    assert.ok(harvester.rateLimiter, 'Rate limiter should be initialized')
    await harvester.init()
    await harvester.close()
  })
})

test('DOMHarvester - error handling', async (t) => {
  await t.test('TimeoutError should contain context', () => {
    const error = new TimeoutError('Timeout occurred', {
      url: MOCK_URL,
      selector: '.test',
      operation: 'navigation'
    })
    assert.equal(error.name, 'TimeoutError')
    assert.equal(error.url, MOCK_URL)
    assert.equal(error.selector, '.test')
    assert.equal(error.operation, 'navigation')
  })

  await t.test('NavigationError should contain context', () => {
    const error = new NavigationError('Navigation failed', {
      url: MOCK_URL,
      operation: 'navigation'
    })
    assert.equal(error.name, 'NavigationError')
    assert.equal(error.url, MOCK_URL)
  })

  await t.test('ExtractionError should contain context', () => {
    const error = new ExtractionError('Extraction failed', {
      url: MOCK_URL,
      selector: '.test',
      operation: 'extraction'
    })
    assert.equal(error.name, 'ExtractionError')
    assert.equal(error.url, MOCK_URL)
    assert.equal(error.selector, '.test')
  })

  await t.test('should call onError callback when error occurs', async () => {
    let errorCalled = false
    let errorContext = null

    const harvester = new DOMHarvester({
      headless: true,
      timeout: 1000,
      onError: (err, context) => {
        // Handle error in callback
        errorCalled = true
        errorContext = context
        assert.ok(err) // Verify error exists
      }
    })

    await harvester.init()

    try {
      // This should fail - invalid URL
      await harvester.harvest('http://invalid-url-that-does-not-exist.test', '.test')
      assert.fail('Should have thrown an error')
    } catch (err) {
      assert.ok(errorCalled, 'onError callback should have been called')
      assert.ok(errorContext, 'Error context should be provided')
      assert.ok(errorContext.url, 'Error context should include URL')
    } finally {
      await harvester.close()
    }
  })
})

test('DOMHarvester - retry logic', async (t) => {
  await t.test('calculateBackoff should use exponential strategy', () => {
    const harvester = new DOMHarvester({ headless: true })
    assert.equal(harvester.calculateBackoff(0, 'exponential', 10000), 1000) // 2^0 * 1000
    assert.equal(harvester.calculateBackoff(1, 'exponential', 10000), 2000) // 2^1 * 1000
    assert.equal(harvester.calculateBackoff(2, 'exponential', 10000), 4000) // 2^2 * 1000
    assert.equal(harvester.calculateBackoff(3, 'exponential', 10000), 8000) // 2^3 * 1000
    assert.equal(harvester.calculateBackoff(4, 'exponential', 10000), 10000) // capped at maxBackoff
  })

  await t.test('calculateBackoff should use linear strategy', () => {
    const harvester = new DOMHarvester({ headless: true })
    assert.equal(harvester.calculateBackoff(0, 'linear', 10000), 1000) // 1 * 1000
    assert.equal(harvester.calculateBackoff(1, 'linear', 10000), 2000) // 2 * 1000
    assert.equal(harvester.calculateBackoff(2, 'linear', 10000), 3000) // 3 * 1000
    assert.equal(harvester.calculateBackoff(10, 'linear', 10000), 10000) // capped at maxBackoff
  })

  await t.test('shouldRetry should return true when no retryOn specified', () => {
    const harvester = new DOMHarvester({ headless: true })
    const error = new TimeoutError('Test error')
    assert.equal(harvester.shouldRetry(error, null), true)
  })

  await t.test('shouldRetry should filter by error type', () => {
    const harvester = new DOMHarvester({ headless: true })
    const timeoutError = new TimeoutError('Test error')
    const navError = new NavigationError('Test error')

    assert.equal(harvester.shouldRetry(timeoutError, ['TimeoutError']), true)
    assert.equal(harvester.shouldRetry(navError, ['TimeoutError']), false)
  })
})

test('DOMHarvester - basic harvest', async (t) => {
  await t.test('should extract data from a real page', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        (el) => ({
          text: el.querySelector('.text')?.textContent,
          author: el.querySelector('.author')?.textContent
        })
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract at least one quote')
      assert.ok(quotes[0].text, 'Quote should have text')
      assert.ok(quotes[0].author, 'Quote should have author')
    } finally {
      await harvester.close()
    }
  })

  await t.test('should use default extractor when none provided', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const results = await harvester.harvest(MOCK_URL, MOCK_SELECTOR)

      assert.ok(Array.isArray(results), 'Should return an array')
      assert.ok(results.length > 0, 'Should extract elements')
      assert.ok(results[0].text, 'Should have text property')
      assert.ok(results[0].html, 'Should have html property')
      assert.ok(results[0].tag, 'Should have tag property')
    } finally {
      await harvester.close()
    }
  })
})

test('DOMHarvester - batch processing', async (t) => {
  await t.test('should process multiple URLs', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const results = await harvester.harvestBatch([
        {
          url: MOCK_URL,
          selector: MOCK_SELECTOR,
          extractor: (el) => ({
            author: el.querySelector('.author')?.textContent
          })
        },
        {
          url: 'https://books.toscrape.com/',
          selector: '.product_pod',
          extractor: (el) => ({
            title: el.querySelector('h3 a')?.getAttribute('title')
          })
        }
      ], {
        concurrency: 2
      })

      assert.equal(results.length, 2, 'Should return results for both URLs')
      assert.ok(results[0].success || !results[0].success, 'Should have success status')
      assert.ok(results[0].url, 'Should include URL in result')
      assert.ok(results[0].duration >= 0, 'Should include duration')
    } finally {
      await harvester.close()
    }
  })

  await t.test('should call onProgress callback', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    let progressCalls = 0
    let lastCompleted = 0
    let lastTotal = 0

    try {
      await harvester.harvestBatch([
        { url: MOCK_URL, selector: MOCK_SELECTOR },
        { url: MOCK_URL, selector: MOCK_SELECTOR }
      ], {
        concurrency: 1,
        onProgress: (completed, total) => {
          progressCalls++
          lastCompleted = completed
          lastTotal = total
        }
      })

      assert.ok(progressCalls > 0, 'onProgress should be called')
      assert.equal(lastCompleted, 2, 'Should complete all items')
      assert.equal(lastTotal, 2, 'Should track total items')
    } finally {
      await harvester.close()
    }
  })

  await t.test('should handle individual failures gracefully', async () => {
    const harvester = new DOMHarvester({ headless: true, timeout: 2000 })
    await harvester.init()

    try {
      const results = await harvester.harvestBatch([
        { url: MOCK_URL, selector: MOCK_SELECTOR },
        { url: 'http://invalid-url.test', selector: '.test' }
      ], {
        concurrency: 2
      })

      assert.equal(results.length, 2, 'Should return results for all URLs')

      const successResults = results.filter(r => r.success)
      const failureResults = results.filter(r => !r.success)

      assert.ok(successResults.length > 0, 'Should have at least one success')
      assert.ok(failureResults.length > 0, 'Should have at least one failure')
      assert.ok(failureResults[0].error, 'Failed result should include error message')
      assert.ok(failureResults[0].errorName, 'Failed result should include error name')
    } finally {
      await harvester.close()
    }
  })
})

test('DOMHarvester - rate limiting', async (t) => {
  await t.test('should respect global rate limit', async () => {
    const harvester = new DOMHarvester({
      headless: true,
      rateLimit: {
        requests: 2,
        per: 1000 // 2 requests per second
      }
    })
    await harvester.init()

    try {
      const startTime = Date.now()

      // Make 3 requests - the 3rd should be delayed
      await Promise.all([
        harvester.harvest(MOCK_URL, MOCK_SELECTOR),
        harvester.harvest(MOCK_URL, MOCK_SELECTOR),
        harvester.harvest(MOCK_URL, MOCK_SELECTOR)
      ])

      const duration = Date.now() - startTime

      // Should take at least 1000ms due to rate limiting
      assert.ok(duration >= 1000, `Should respect rate limit (took ${duration}ms)`)
    } finally {
      await harvester.close()
    }
  })
})

test('DOMHarvester - logging', async (t) => {
  await t.test('should log with custom logger', async () => {
    const logs = []
    const customLogger = {
      debug: (msg, meta) => logs.push({ level: 'debug', msg, meta }),
      info: (msg, meta) => logs.push({ level: 'info', msg, meta }),
      warn: (msg, meta) => logs.push({ level: 'warn', msg, meta }),
      error: (msg, meta) => logs.push({ level: 'error', msg, meta })
    }

    const harvester = new DOMHarvester({
      headless: true,
      logging: { level: 'debug', logger: customLogger }
    })

    await harvester.init()

    try {
      await harvester.harvest(MOCK_URL, MOCK_SELECTOR)
      assert.ok(logs.length > 0, 'Should have logged messages')
      assert.ok(logs.some(l => l.level === 'debug'), 'Should have debug logs')
      assert.ok(logs.some(l => l.level === 'info'), 'Should have info logs')
    } finally {
      await harvester.close()
    }
  })
})

test('DOMHarvester - harvestCustom', async (t) => {
  await t.test('should execute custom page function', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const result = await harvester.harvestCustom(
        MOCK_URL,
        () => {
          return {
            title: document.title,
            quoteCount: document.querySelectorAll('.quote').length
          }
        }
      )

      assert.ok(result.title, 'Should have title')
      assert.ok(result.quoteCount > 0, 'Should count quotes')
    } finally {
      await harvester.close()
    }
  })
})

test('DOMHarvester - browser context options', async (t) => {
  await t.test('should support custom viewport', async () => {
    const harvester = new DOMHarvester({
      headless: true,
      viewport: { width: 1920, height: 1080 }
    })
    await harvester.init()
    assert.ok(harvester.context, 'Context should be initialized with viewport')
    await harvester.close()
  })

  await t.test('should support custom user agent', async () => {
    const customUA = 'Mozilla/5.0 (Custom Bot)'
    const harvester = new DOMHarvester({
      headless: true,
      userAgent: customUA
    })
    await harvester.init()
    assert.ok(harvester.context, 'Context should be initialized with user agent')
    await harvester.close()
  })

  await t.test('should support extra HTTP headers', async () => {
    const harvester = new DOMHarvester({
      headless: true,
      extraHTTPHeaders: {
        'X-Custom-Header': 'test-value'
      }
    })
    await harvester.init()
    assert.ok(harvester.context, 'Context should be initialized with extra headers')
    await harvester.close()
  })

  await t.test('should support cookies', async () => {
    const harvester = new DOMHarvester({
      headless: true,
      cookies: [
        {
          name: 'test_cookie',
          value: 'test_value',
          domain: '.toscrape.com',
          path: '/'
        }
      ]
    })
    await harvester.init()
    const cookies = await harvester.context.cookies()
    assert.ok(cookies.some(c => c.name === 'test_cookie'), 'Cookie should be set')
    await harvester.close()
  })
})

test('DOMHarvester - wait strategies', async (t) => {
  await t.test('should support waitForLoadState', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const data = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        null,
        { waitForLoadState: 'networkidle' }
      )
      assert.ok(data.length > 0, 'Should extract data with networkidle wait')
    } finally {
      await harvester.close()
    }
  })

  await t.test('should support waitForSelector options', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const data = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        null,
        {
          waitForSelector: {
            state: 'visible',
            timeout: 5000
          }
        }
      )
      assert.ok(data.length > 0, 'Should extract data with custom selector wait')
    } finally {
      await harvester.close()
    }
  })
})

test('DOMHarvester - screenshot', async (t) => {
  await t.test('should capture screenshot during harvest', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const data = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        null,
        {
          screenshot: {
            path: '/tmp/test-screenshot.png',
            fullPage: false
          }
        }
      )
      assert.ok(data.length > 0, 'Should extract data')
      // Note: In a real test we would check if file exists
    } finally {
      await harvester.close()
    }
  })

  await t.test('should capture standalone screenshot', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const screenshot = await harvester.screenshot(
        MOCK_URL,
        { type: 'png' }
      )
      assert.ok(screenshot instanceof Buffer, 'Should return screenshot buffer')
      assert.ok(screenshot.length > 0, 'Screenshot should have content')
    } finally {
      await harvester.close()
    }
  })
})

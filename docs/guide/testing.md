# Testing & Code Quality

DOMHarvest Playwright maintains high code quality standards with comprehensive test coverage and documentation.

## Test Coverage

The project maintains **86%+ test coverage** across all core functionality, ensuring reliability and catching regressions early.

### Running Tests

```bash
# Run all tests with linting
npm test

# Run tests with coverage report
npm run test:coverage

# View coverage in browser
npm run test:coverage
open coverage/index.html
```

### Coverage Report

The coverage report includes:
- **Statement coverage**: 86.62%
- **Branch coverage**: 71.65%
- **Function coverage**: 89.65%
- **Line coverage**: 86.62%

Coverage reports are generated in three formats:
- **Text**: Console output
- **LCOV**: For CI/CD integration
- **HTML**: Interactive browsable report in `coverage/` directory

## Test Structure

Tests are organized by functionality using Node.js built-in test runner:

```javascript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DOMHarvester } from 'domharvest-playwright'

test('DOMHarvester - basic functionality', async (t) => {
  await t.test('should initialize successfully', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()
    assert.ok(harvester.browser)
    await harvester.close()
  })
})
```

## Test Categories

### 1. Initialization Tests
- Browser and context creation
- Configuration validation
- Logging setup
- Rate limiter initialization

### 2. Harvesting Tests
- Basic data extraction
- Custom extractors
- Default extractor behavior
- Real-world page scraping

### 3. Error Handling Tests
- Timeout scenarios
- Navigation failures
- Extraction errors
- Error context preservation
- Error callbacks

### 4. Retry Logic Tests
- Exponential backoff
- Linear backoff
- Selective retry (retryOn)
- Retry exhaustion

### 5. Batch Processing Tests
- Concurrent request handling
- Progress callbacks
- Individual failure handling
- Result aggregation

### 6. Rate Limiting Tests
- Global rate limits
- Per-domain rate limits
- Request throttling

### 7. Browser Context Tests
- Custom viewport
- User agent configuration
- Extra HTTP headers
- Cookie management

### 8. Wait Strategy Tests
- Load state waiting
- Selector waiting
- Network idle detection

### 9. Screenshot Tests
- Full page screenshots
- Viewport screenshots
- Screenshot with selector wait
- Error handling

### 10. Helper Function Tests
- Standalone `harvest()` function
- Option pass-through
- Automatic lifecycle management

## Writing Tests

### Example: Testing a New Feature

```javascript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DOMHarvester } from 'domharvest-playwright'

test('My new feature', async (t) => {
  await t.test('should work correctly', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const result = await harvester.myNewFeature()
      assert.ok(result)
      assert.equal(typeof result, 'object')
    } finally {
      await harvester.close()
    }
  })

  await t.test('should handle errors', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      await assert.rejects(
        harvester.myNewFeature({ invalid: true }),
        {
          name: 'ValidationError',
          message: /expected format/
        }
      )
    } finally {
      await harvester.close()
    }
  })
})
```

## Code Quality Standards

### JSDoc Documentation

All public APIs are fully documented with JSDoc:

```javascript
/**
 * Navigate to a URL and extract data using a CSS selector
 *
 * @async
 * @param {string} url - The URL to visit
 * @param {string} selector - CSS selector for elements to extract
 * @param {Function|null} [extractor=null] - Function to extract data from each element
 * @param {Object} [options={}] - Operation options
 * @returns {Promise<Array>} Array of extracted data objects
 * @throws {NavigationError} If page navigation fails
 * @example
 * const data = await harvester.harvest('https://example.com', '.product')
 */
async harvest(url, selector, extractor = null, options = {}) {
  // ...
}
```

### Linting

Code follows [JavaScript Standard Style](https://standardjs.com/):

```bash
# Check code style
npm run lint

# Auto-fix style issues
npm run lint:fix
```

### Type Safety

While the project uses JavaScript, comprehensive JSDoc provides type information for:
- IDE autocomplete
- Type checking in editors
- Better developer experience
- Documentation generation

## Continuous Integration

### GitHub Actions (Coming Soon)

Tests run automatically on:
- Every pull request
- Every commit to main
- Scheduled nightly builds

### Test Coverage Requirements

- Minimum 80% statement coverage
- All new features must include tests
- Bug fixes must include regression tests

## Best Practices

### 1. Test Real Scenarios

Use real websites for integration tests:

```javascript
const MOCK_URL = 'https://quotes.toscrape.com/'
const data = await harvester.harvest(MOCK_URL, '.quote')
```

### 2. Clean Up Resources

Always close harvester instances:

```javascript
const harvester = new DOMHarvester()
await harvester.init()

try {
  // Tests here
} finally {
  await harvester.close()
}
```

### 3. Test Error Cases

Don't just test the happy path:

```javascript
await t.test('should handle invalid URLs', async () => {
  try {
    await harvester.harvest('http://invalid.test', '.selector')
    assert.fail('Should have thrown')
  } catch (error) {
    assert.ok(error instanceof NavigationError)
  }
})
```

### 4. Use Descriptive Test Names

```javascript
// Good
await t.test('should retry 3 times with exponential backoff', async () => {})

// Bad
await t.test('test retry', async () => {})
```

### 5. Keep Tests Fast

- Use headless mode
- Minimize network requests
- Mock external services when appropriate
- Use concurrency where possible

## Debugging Tests

### Run Specific Test

```bash
# Run only tests matching pattern
node --test --test-name-pattern="screenshot"
```

### Debug with Visible Browser

```javascript
const harvester = new DOMHarvester({
  headless: false  // See what's happening
})
```

### Enable Debug Logging

```javascript
const harvester = new DOMHarvester({
  logging: {
    level: 'debug'
  }
})
```

## Contributing Tests

When contributing:

1. Write tests for all new features
2. Ensure existing tests still pass
3. Add tests for bug fixes
4. Aim for 80%+ coverage
5. Follow existing test patterns
6. Document complex test scenarios

## Next Steps

- Explore [Examples](/guide/examples) for usage patterns
- Check [API Reference](/api/harvester) for method documentation
- Read [Configuration](/guide/configuration) for setup options

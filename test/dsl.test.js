import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DOMHarvester, text, attr, array, exists, html, count } from '../src/harvester.js'

// Mock data for testing
const MOCK_URL = 'https://quotes.toscrape.com/'
const MOCK_SELECTOR = '.quote'

test('DSL - text() helper', async (t) => {
  await t.test('should extract text content using DSL', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          text: text('.text'),
          author: text('.author')
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.ok(quotes[0].text, 'Should have text property')
      assert.ok(quotes[0].author, 'Should have author property')
      assert.ok(typeof quotes[0].text === 'string', 'Text should be string')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - attr() helper', async (t) => {
  await t.test('should extract attributes using DSL', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          quoteText: text('.text'),
          authorLink: attr('.author + a', 'href')
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.ok(quotes[0].quoteText, 'Should have quote text')
      assert.ok(quotes[0].authorLink, 'Should have author link')
      assert.ok(quotes[0].authorLink.includes('/author/'), 'Link should be author URL')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - array() helper', async (t) => {
  await t.test('should extract arrays using DSL', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          text: text('.text'),
          tags: array('.tag', text())
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.ok(Array.isArray(quotes[0].tags), 'Tags should be an array')
      assert.ok(quotes[0].tags.length > 0, 'Should have tags')
      assert.ok(typeof quotes[0].tags[0] === 'string', 'Tag should be string')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - exists() helper', async (t) => {
  await t.test('should check element existence using DSL', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          hasText: exists('.text'),
          hasAuthor: exists('.author'),
          hasNonExistent: exists('.non-existent')
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.equal(quotes[0].hasText, true, 'Should find text element')
      assert.equal(quotes[0].hasAuthor, true, 'Should find author element')
      assert.equal(quotes[0].hasNonExistent, false, 'Should not find non-existent element')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - html() helper', async (t) => {
  await t.test('should extract HTML content using DSL', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          textHTML: html('.text')
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.ok(quotes[0].textHTML, 'Should have HTML content')
      assert.ok(typeof quotes[0].textHTML === 'string', 'HTML should be string')
      assert.ok(quotes[0].textHTML.length > 0, 'HTML should not be empty')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - count() helper', async (t) => {
  await t.test('should count elements using DSL', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          tagCount: count('.tag')
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.ok(typeof quotes[0].tagCount === 'number', 'Count should be number')
      assert.ok(quotes[0].tagCount > 0, 'Should have tags')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - nested objects', async (t) => {
  await t.test('should support nested object extraction', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          content: {
            text: text('.text'),
            html: html('.text')
          },
          meta: {
            author: text('.author'),
            tagCount: count('.tag')
          }
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.ok(quotes[0].content, 'Should have content object')
      assert.ok(quotes[0].meta, 'Should have meta object')
      assert.ok(quotes[0].content.text, 'Should have nested text')
      assert.ok(quotes[0].meta.author, 'Should have nested author')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - mixed mode (DSL + custom functions)', async (t) => {
  await t.test('should support mixing DSL with custom functions', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          // DSL
          text: text('.text'),
          author: text('.author'),
          // Custom function
          customField: (el) => {
            return 'custom-' + el.querySelector('.author')?.textContent
          }
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.ok(quotes[0].text, 'Should have DSL text')
      assert.ok(quotes[0].author, 'Should have DSL author')
      assert.ok(quotes[0].customField, 'Should have custom field')
      assert.ok(quotes[0].customField.startsWith('custom-'), 'Custom field should have prefix')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - backward compatibility', async (t) => {
  await t.test('should still work with pure function extractors', async () => {
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
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.ok(quotes[0].text, 'Should have text')
      assert.ok(quotes[0].author, 'Should have author')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - default values', async (t) => {
  await t.test('should use default values for missing elements', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          text: text('.text'),
          nonExistent: text('.non-existent', { default: 'N/A' }),
          missingAttr: attr('a', 'data-missing', { default: 'default-value' })
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.equal(quotes[0].nonExistent, 'N/A', 'Should use default value')
      assert.equal(quotes[0].missingAttr, 'default-value', 'Should use default for missing attribute')
    } finally {
      await harvester.close()
    }
  })
})

test('DSL - array with nested DSL', async (t) => {
  await t.test('should support arrays with nested DSL objects', async () => {
    const harvester = new DOMHarvester({ headless: true })
    await harvester.init()

    try {
      const quotes = await harvester.harvest(
        MOCK_URL,
        MOCK_SELECTOR,
        {
          text: text('.text'),
          tags: array('.tag', {
            name: text(),
            exists: exists()
          })
        }
      )

      assert.ok(Array.isArray(quotes), 'Should return an array')
      assert.ok(quotes.length > 0, 'Should extract quotes')
      assert.ok(Array.isArray(quotes[0].tags), 'Tags should be array')
      if (quotes[0].tags.length > 0) {
        assert.ok(quotes[0].tags[0].name, 'Tag should have name')
        assert.equal(quotes[0].tags[0].exists, true, 'Tag should exist')
      }
    } finally {
      await harvester.close()
    }
  })
})

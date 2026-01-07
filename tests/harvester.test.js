import { test } from 'node:test'
import assert from 'node:assert'
import { DOMHarvester, harvest } from '../src/harvester.js'

test('DOMHarvester - initialize and close', async () => {
  const harvester = new DOMHarvester()
  await harvester.init()
  assert.ok(harvester.browser, 'Browser should be initialized')
  assert.ok(harvester.context, 'Context should be initialized')
  await harvester.close()
})

test('DOMHarvester - harvest with default extractor', async () => {
  const harvester = new DOMHarvester({ headless: true })

  try {
    await harvester.init()
    const results = await harvester.harvest('https://example.com', 'h1')

    assert.ok(Array.isArray(results), 'Results should be an array')
    assert.ok(results.length > 0, 'Should find at least one h1 element')
    assert.ok(results[0].text, 'Should have text property')
    assert.ok(results[0].html, 'Should have html property')
    assert.strictEqual(results[0].tag, 'h1', 'Tag should be h1')
  } finally {
    await harvester.close()
  }
})

test('DOMHarvester - harvest with custom extractor', async () => {
  const harvester = new DOMHarvester({ headless: true })

  try {
    await harvester.init()
    const results = await harvester.harvest(
      'https://example.com',
      'p',
      (el) => ({ content: el.textContent?.trim() })
    )

    assert.ok(Array.isArray(results), 'Results should be an array')
    assert.ok(results.length > 0, 'Should find at least one paragraph')
    assert.ok(results[0].content, 'Should have content property from custom extractor')
  } finally {
    await harvester.close()
  }
})

test('DOMHarvester - harvestCustom with page function', async () => {
  const harvester = new DOMHarvester({ headless: true })

  try {
    await harvester.init()
    const result = await harvester.harvestCustom(
      'https://example.com',
      () => {
        return {
          title: document.title,
          h1Count: document.querySelectorAll('h1').length
        }
      }
    )

    assert.ok(result.title, 'Should have title property')
    assert.strictEqual(typeof result.h1Count, 'number', 'h1Count should be a number')
    assert.ok(result.h1Count > 0, 'Should find at least one h1')
  } finally {
    await harvester.close()
  }
})

test('harvest - convenience function', async () => {
  const results = await harvest(
    'https://example.com',
    'h1',
    (el) => ({ heading: el.textContent?.trim() })
  )

  assert.ok(Array.isArray(results), 'Results should be an array')
  assert.ok(results.length > 0, 'Should find at least one h1')
  assert.ok(results[0].heading, 'Should have heading property')
})

test('DOMHarvester - custom options', async () => {
  const harvester = new DOMHarvester({
    headless: true,
    timeout: 10000
  })

  assert.strictEqual(harvester.options.headless, true, 'Should use custom headless option')
  assert.strictEqual(harvester.options.timeout, 10000, 'Should use custom timeout option')

  await harvester.init()
  await harvester.close()
})

---
layout: home

hero:
  name: DOMHarvest
  text: Playwright-powered web scraping
  tagline: Extract DOM elements with precision and speed
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/domharvest/domharvest-playwright

features:
  - icon: 🎯
    title: Precise Extraction
    details: Extract DOM elements using CSS selectors or custom functions with Playwright's powerful automation.
  - icon: 🚀
    title: Fast & Reliable
    details: Built on Playwright for consistent, cross-browser web scraping with excellent performance.
  - icon: 📦
    title: Simple API
    details: Clean, intuitive API that makes web scraping straightforward and enjoyable.
  - icon: 🔧
    title: Highly Configurable
    details: Customize timeouts, headless mode, and extraction logic to fit your needs.
  - icon: ✨
    title: Modern JavaScript
    details: Uses ES modules and modern JavaScript features for a clean development experience.
  - icon: 🧪
    title: Well Tested
    details: Comprehensive test suite ensuring reliability and stability.
---

## Quick Example

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

## Why DOMHarvest?

DOMHarvest makes web scraping simple and reliable by leveraging Playwright's battle-tested browser automation. Whether you're building a data pipeline, monitoring websites, or extracting content for analysis, DOMHarvest provides the tools you need with minimal setup.

## Features at a Glance

- **Easy to use**: Simple API for common scraping tasks
- **Powerful**: Access to full Playwright capabilities when needed
- **Flexible**: Support for both simple selectors and custom extraction logic
- **Standard compliant**: Follows JavaScript Standard Style
- **Well documented**: Comprehensive guides and API documentation

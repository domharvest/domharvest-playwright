# Getting Started

Welcome to DOMHarvest! This guide will help you get up and running with DOM harvesting using Playwright.

## What is DOMHarvest?

DOMHarvest is a lightweight, powerful tool for extracting data from web pages using Playwright's browser automation capabilities. It provides a simple API for common web scraping tasks while giving you access to Playwright's full power when needed.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher installed
- Basic knowledge of JavaScript and CSS selectors
- Familiarity with async/await syntax

## Installation

See the [Installation Guide](/guide/installation) for detailed setup instructions.

## Your First Harvest

Let's extract all paragraph texts from a web page:

```javascript
import { harvest } from 'domharvest-playwright'

const paragraphs = await harvest(
  'https://example.com',
  'p',
  (el) => ({ text: el.textContent?.trim() })
)

console.log(paragraphs)
```

That's it! You've just extracted data from a web page with three simple parameters:

1. **URL**: The page to scrape
2. **Selector**: CSS selector for the elements you want
3. **Extractor**: Function to transform each element into the data you need

## Next Steps

- Learn more in the [Quick Start Guide](/guide/quick-start)
- Explore [Examples](/guide/examples) for common use cases
- Check the [API Reference](/api/harvester) for detailed documentation

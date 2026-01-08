# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.2.1](https://github.com/domharvest/domharvest-playwright/compare/v1.2.0...v1.2.1) (2026-01-08)


### Features

* add automated GitHub Release creation on tag push ([b922884](https://github.com/domharvest/domharvest-playwright/commit/b9228848c5d19cfb65350169038e9acab0fc169c))


### Documentation

* update examples with realistic scraping practice sites ([a5f2e66](https://github.com/domharvest/domharvest-playwright/commit/a5f2e66dd763f5abca7272dee04a82cc188c75bc))

## 1.2.0 (2026-01-07)


### Features

* add documentation, CI/CD, and npm publishing setup ([268ad2e](https://github.com/domharvest/domharvest-playwright/commit/268ad2e83f834900dd4f291df7e2b665dfca6abf))
* implement core DOM harvesting functionality ([5bfce4d](https://github.com/domharvest/domharvest-playwright/commit/5bfce4d2fd1a64b16ee5f4ce0a7b23cfa9a31740))


### Bug Fixes

* **ci:** install Playwright browsers before running tests in publish workflow ([bc24d82](https://github.com/domharvest/domharvest-playwright/commit/bc24d826e79f754dfa3bef4d2ec96a4fc31473c7))


### Documentation

* clarify GitHub Pages setup instructions ([789fafb](https://github.com/domharvest/domharvest-playwright/commit/789fafbbabb5bef74ce159381dcbd08e1c823cd0))

## 1.1.0 (2026-01-07)


### Features

* add documentation, CI/CD, and npm publishing setup ([268ad2e](https://github.com/domharvest/domharvest-playwright/commit/268ad2e83f834900dd4f291df7e2b665dfca6abf))
* implement core DOM harvesting functionality ([5bfce4d](https://github.com/domharvest/domharvest-playwright/commit/5bfce4d2fd1a64b16ee5f4ce0a7b23cfa9a31740))


### Documentation

* clarify GitHub Pages setup instructions ([789fafb](https://github.com/domharvest/domharvest-playwright/commit/789fafbbabb5bef74ce159381dcbd08e1c823cd0))

## 1.0.0 (2026-01-07)

### Features

* implement core DOM harvesting functionality ([5bfce4d](https://github.com/domharvest/domharvest-playwright/commit/5bfce4d))
  - DOMHarvester class with Playwright-based web scraping
  - harvest() method for CSS selector-based extraction
  - harvestCustom() for custom page evaluation functions
  - Configurable options (headless mode, timeout)
  - Comprehensive test suite with 6 passing tests
  - Practical examples demonstrating key features

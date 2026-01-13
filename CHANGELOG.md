# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.3.0](https://github.com/domharvest/domharvest-playwright/compare/v1.2.2...v1.3.0) (2026-01-13)


### Features

* **dsl:** add declarative DSL for data extraction ([22f06f9](https://github.com/domharvest/domharvest-playwright/commit/22f06f9))
  - text() helper for text content extraction with trimming
  - attr() helper for attribute extraction
  - array() helper for extracting arrays of elements
  - exists() helper for element existence checks
  - html() helper for innerHTML extraction
  - count() helper for counting elements
  - Pure DSL mode with optimized browser-side execution
  - Mixed mode support (DSL + custom functions)
  - Nested objects and complex schema composition
  - 83% test coverage for DSL module

* **auth:** add authentication and session management ([8ee53aa](https://github.com/domharvest/domharvest-playwright/commit/8ee53aa))
  - fillLoginForm() with auto-detection of login form fields
  - saveCookies() and loadCookies() for cookie persistence
  - SessionManager class for complete session state management
  - login() helper combining all authentication features
  - Multi-account support with session isolation
  - 95.84% test coverage for auth module

* **ci:** add coverage threshold check (≥80%) ([a762f16](https://github.com/domharvest/domharvest-playwright/commit/a762f16))
  - Enforce 80% code coverage for lines, functions, and statements
  - Enforce 70% branch coverage
  - Automated checks in CI pipeline


### Documentation

* add comprehensive DSL documentation ([ecd83f7](https://github.com/domharvest/domharvest-playwright/commit/ecd83f7))
  - Complete API reference for all DSL helpers
  - User guide with practical examples
  - Advanced patterns and performance considerations

* add comprehensive authentication documentation ([190010a](https://github.com/domharvest/domharvest-playwright/commit/190010a))
  - Complete API reference for all auth helpers
  - User guide with real-world examples (GitHub scraping, multi-account)
  - Security best practices and troubleshooting
  - Integration patterns with DOMHarvester

* add testing & code quality documentation ([32a5481](https://github.com/domharvest/domharvest-playwright/commit/32a5481))


### [1.2.2](https://github.com/domharvest/domharvest-playwright/compare/v1.2.1...v1.2.2) (2026-01-11)


### Features

* add advanced browser configuration and screenshot capabilities ([6c415f4](https://github.com/domharvest/domharvest-playwright/commit/6c415f475a18cbf0d99094c45026aa2a3f46399e))


### Documentation

* add GoatCounter analytics to documentation site ([59df7c3](https://github.com/domharvest/domharvest-playwright/commit/59df7c319de74b3e8852a6d114edc01a8b404e22))

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

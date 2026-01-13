/**
 * Authentication helpers for DOMHarvest Playwright
 * Provides utilities for handling login, sessions, and cookies
 */

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

/**
 * Fill and submit a login form
 *
 * @async
 * @param {import('playwright').Page} page - Playwright page instance
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username or email
 * @param {string} credentials.password - Password
 * @param {Object} [selectors] - Form field selectors
 * @param {string} [selectors.usernameSelector='input[name="username"], input[type="email"], input[name="email"]'] - Username field selector
 * @param {string} [selectors.passwordSelector='input[name="password"], input[type="password"]'] - Password field selector
 * @param {string} [selectors.submitSelector='button[type="submit"], input[type="submit"]'] - Submit button selector
 * @param {Object} [options={}] - Additional options
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @param {string} [options.waitForNavigation=true] - Wait for navigation after submit
 * @returns {Promise<void>}
 * @throws {Error} If form fields are not found or submission fails
 * @example
 * const page = await context.newPage()
 * await page.goto('https://example.com/login')
 * await fillLoginForm(page, { username: 'user@example.com', password: 'pass123' })
 */
export async function fillLoginForm (page, credentials, selectors = {}, options = {}) {
  const {
    usernameSelector = 'input[name="username"], input[type="email"], input[name="email"]',
    passwordSelector = 'input[name="password"], input[type="password"]',
    submitSelector = 'button[type="submit"], input[type="submit"]'
  } = selectors

  const {
    timeout = 30000,
    waitForNavigation = true
  } = options

  // Fill username field
  const usernameField = await page.waitForSelector(usernameSelector, { timeout })
  if (!usernameField) {
    throw new Error(`Username field not found with selector: ${usernameSelector}`)
  }
  await usernameField.fill(credentials.username)

  // Fill password field
  const passwordField = await page.waitForSelector(passwordSelector, { timeout })
  if (!passwordField) {
    throw new Error(`Password field not found with selector: ${passwordSelector}`)
  }
  await passwordField.fill(credentials.password)

  // Submit form
  const submitButton = await page.waitForSelector(submitSelector, { timeout })
  if (!submitButton) {
    throw new Error(`Submit button not found with selector: ${submitSelector}`)
  }

  if (waitForNavigation) {
    await Promise.all([
      page.waitForNavigation({ timeout }),
      submitButton.click()
    ])
  } else {
    await submitButton.click()
  }
}

/**
 * Save browser cookies to a file or return as JSON
 *
 * @async
 * @param {import('playwright').BrowserContext} context - Browser context
 * @param {string} [filePath] - Optional file path to save cookies
 * @returns {Promise<Array>} Array of cookie objects
 * @example
 * // Save to file
 * await saveCookies(context, './cookies.json')
 *
 * // Get cookies as array
 * const cookies = await saveCookies(context)
 */
export async function saveCookies (context, filePath = null) {
  const cookies = await context.cookies()

  if (filePath) {
    const { writeFileSync } = await import('fs')
    writeFileSync(filePath, JSON.stringify(cookies, null, 2))
  }

  return cookies
}

/**
 * Load cookies from a file or array into browser context
 *
 * @async
 * @param {import('playwright').BrowserContext} context - Browser context
 * @param {string|Array} cookiesOrPath - Path to cookies file or array of cookies
 * @returns {Promise<void>}
 * @example
 * // Load from file
 * await loadCookies(context, './cookies.json')
 *
 * // Load from array
 * await loadCookies(context, [{ name: 'session', value: 'abc123', domain: '.example.com', path: '/' }])
 */
export async function loadCookies (context, cookiesOrPath) {
  let cookies

  if (typeof cookiesOrPath === 'string') {
    const { readFileSync } = await import('fs')
    const fileContent = readFileSync(cookiesOrPath, 'utf-8')
    cookies = JSON.parse(fileContent)
  } else if (Array.isArray(cookiesOrPath)) {
    cookies = cookiesOrPath
  } else {
    throw new Error('cookiesOrPath must be a file path string or array of cookies')
  }

  await context.addCookies(cookies)
}

/**
 * Simple session manager for persisting authentication state
 */
export class SessionManager {
  /**
   * Create a new session manager
   * @param {Object} [options={}] - Session options
   * @param {string} [options.storageDir='./sessions'] - Directory to store session files
   */
  constructor (options = {}) {
    this.storageDir = options.storageDir || './sessions'
    this.sessions = new Map()
  }

  /**
   * Save session (cookies + storage state)
   *
   * @async
   * @param {string} sessionId - Unique session identifier
   * @param {import('playwright').BrowserContext} context - Browser context
   * @returns {Promise<string>} Path to saved session file
   * @example
   * const sessionManager = new SessionManager()
   * await sessionManager.saveSession('user123', context)
   */
  async saveSession (sessionId, context) {
    const { mkdirSync, existsSync } = await import('fs')
    const { join } = await import('path')

    // Ensure storage directory exists
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true })
    }

    const sessionPath = join(this.storageDir, `${sessionId}.json`)

    // Save storage state (includes cookies, localStorage, sessionStorage)
    await context.storageState({ path: sessionPath })

    // Cache in memory
    this.sessions.set(sessionId, sessionPath)

    return sessionPath
  }

  /**
   * Load session (cookies + storage state)
   *
   * @async
   * @param {string} sessionId - Unique session identifier
   * @param {import('playwright').Browser} browser - Browser instance
   * @returns {Promise<import('playwright').BrowserContext>} Browser context with loaded session
   * @throws {Error} If session file not found
   * @example
   * const sessionManager = new SessionManager()
   * const context = await sessionManager.loadSession('user123', browser)
   */
  async loadSession (sessionId, browser) {
    const { existsSync } = await import('fs')
    const { join } = await import('path')

    const sessionPath = this.sessions.get(sessionId) || join(this.storageDir, `${sessionId}.json`)

    if (!existsSync(sessionPath)) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    // Create new context with saved state
    const context = await browser.newContext({
      storageState: sessionPath
    })

    return context
  }

  /**
   * Check if session exists
   *
   * @param {string} sessionId - Unique session identifier
   * @returns {boolean} True if session exists
   * @example
   * if (sessionManager.hasSession('user123')) {
   *   context = await sessionManager.loadSession('user123', browser)
   * }
   */
  hasSession (sessionId) {
    const fs = require('fs')
    const path = require('path')

    if (this.sessions.has(sessionId)) {
      return true
    }

    const sessionPath = path.join(this.storageDir, `${sessionId}.json`)
    return fs.existsSync(sessionPath)
  }

  /**
   * Delete session
   *
   * @async
   * @param {string} sessionId - Unique session identifier
   * @returns {Promise<boolean>} True if session was deleted
   * @example
   * await sessionManager.deleteSession('user123')
   */
  async deleteSession (sessionId) {
    const { unlinkSync, existsSync } = await import('fs')
    const { join } = await import('path')

    const sessionPath = this.sessions.get(sessionId) || join(this.storageDir, `${sessionId}.json`)

    if (existsSync(sessionPath)) {
      unlinkSync(sessionPath)
      this.sessions.delete(sessionId)
      return true
    }

    return false
  }

  /**
   * List all available sessions
   *
   * @returns {Promise<Array<string>>} Array of session IDs
   * @example
   * const sessions = await sessionManager.listSessions()
   * console.log('Available sessions:', sessions)
   */
  async listSessions () {
    const { readdirSync, existsSync } = await import('fs')

    if (!existsSync(this.storageDir)) {
      return []
    }

    const files = readdirSync(this.storageDir)
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
  }
}

/**
 * Helper to perform login and save session in one operation
 *
 * @async
 * @param {import('playwright').Page} page - Playwright page instance
 * @param {string} loginUrl - URL of login page
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username or email
 * @param {string} credentials.password - Password
 * @param {Object} [options={}] - Additional options
 * @param {Object} [options.selectors] - Form field selectors
 * @param {string} [options.sessionId] - Session ID for saving (if using SessionManager)
 * @param {SessionManager} [options.sessionManager] - SessionManager instance
 * @param {string} [options.cookiesPath] - Path to save cookies file
 * @param {string} [options.successSelector] - Selector to verify successful login
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 * @throws {Error} If login fails
 * @example
 * // Basic login
 * await login(page, 'https://example.com/login', {
 *   username: 'user@example.com',
 *   password: 'pass123'
 * })
 *
 * // Login with session manager
 * const sessionManager = new SessionManager()
 * await login(page, 'https://example.com/login', {
 *   username: 'user@example.com',
 *   password: 'pass123'
 * }, {
 *   sessionId: 'user123',
 *   sessionManager,
 *   successSelector: '.user-profile'
 * })
 */
export async function login (page, loginUrl, credentials, options = {}) {
  const {
    selectors = {},
    sessionId = null,
    sessionManager = null,
    cookiesPath = null,
    successSelector = null,
    timeout = 30000
  } = options

  // Navigate to login page
  await page.goto(loginUrl, { timeout })

  // Fill and submit form
  await fillLoginForm(page, credentials, selectors, { timeout })

  // Verify successful login if selector provided
  if (successSelector) {
    await page.waitForSelector(successSelector, { timeout })
  }

  // Save session if requested
  if (sessionManager && sessionId) {
    await sessionManager.saveSession(sessionId, page.context())
  }

  // Save cookies if path provided
  if (cookiesPath) {
    await saveCookies(page.context(), cookiesPath)
  }
}

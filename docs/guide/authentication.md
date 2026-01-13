# Authentication & Sessions

Learn how to handle authentication and maintain sessions when scraping authenticated content.

## Why Authentication Matters

Many websites require authentication to access content:
- User profiles and dashboards
- Private repositories
- Personalized data
- Members-only areas

DOMHarvest provides comprehensive authentication helpers to handle:
- Form-based login
- Cookie persistence
- Session management
- Multi-account support

## Quick Start

Basic login example:

```javascript
import { DOMHarvester, login } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })
await harvester.init()

try {
  const page = await harvester.context.newPage()

  // Login
  await login(
    page,
    'https://example.com/login',
    {
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    }
  )

  // Now scrape authenticated content
  await page.goto('https://example.com/dashboard')
  // ... extract data ...
} finally {
  await harvester.close()
}
```

## Form-Based Authentication

### Auto-Detect Form Fields

DOMHarvest automatically detects common login form patterns:

```javascript
import { fillLoginForm } from 'domharvest-playwright'

await page.goto('https://example.com/login')

// Auto-detects username, password, and submit button
await fillLoginForm(page, {
  username: 'user@example.com',
  password: 'password123'
})
```

Default selectors:
- **Username**: `input[name="username"]`, `input[type="email"]`, `input[name="email"]`
- **Password**: `input[name="password"]`, `input[type="password"]`
- **Submit**: `button[type="submit"]`, `input[type="submit"]`

### Custom Form Selectors

For non-standard forms, provide custom selectors:

```javascript
await fillLoginForm(
  page,
  {
    username: 'user@example.com',
    password: 'password123'
  },
  {
    usernameSelector: '#email-input',
    passwordSelector: '#pwd',
    submitSelector: '.login-btn'
  }
)
```

### Skip Navigation Wait

For AJAX-based logins that don't navigate:

```javascript
await fillLoginForm(
  page,
  { username: 'user', password: 'pass' },
  {},
  { waitForNavigation: false }
)

// Wait for success indicator instead
await page.waitForSelector('.success-message')
```

## Cookie Management

### Save Cookies

Save cookies after authentication:

```javascript
import { saveCookies } from 'domharvest-playwright'

// Login first
await fillLoginForm(page, credentials)

// Save cookies to file
await saveCookies(context, './cookies.json')

// Or get as array
const cookies = await saveCookies(context)
```

### Load Cookies

Restore cookies to skip login:

```javascript
import { loadCookies } from 'domharvest-playwright'

// Load from file
await loadCookies(context, './cookies.json')

// Or load from array
await loadCookies(context, [
  {
    name: 'session_id',
    value: 'abc123xyz',
    domain: '.example.com',
    path: '/',
    httpOnly: true,
    secure: true
  }
])

// Navigate - already authenticated!
await page.goto('https://example.com/dashboard')
```

## Session Management

### Basic Session Usage

SessionManager provides complete session persistence:

```javascript
import { SessionManager } from 'domharvest-playwright'

const sessionManager = new SessionManager({
  storageDir: './auth-sessions'
})

// Check if session exists
if (!sessionManager.hasSession('myaccount')) {
  // First time: login and save
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('https://example.com/login')
  await fillLoginForm(page, credentials)

  // Save complete session state
  await sessionManager.saveSession('myaccount', context)
  await context.close()
}

// Load existing session
const context = await sessionManager.loadSession('myaccount', browser)
const page = await context.newPage()
await page.goto('https://example.com/dashboard')
// Automatically logged in!
```

### Session Benefits

SessionManager saves more than just cookies:
- 🍪 **Cookies** - Authentication tokens
- 💾 **localStorage** - Client-side storage
- 📦 **sessionStorage** - Session-specific data
- 🔐 **Origins** - Permissions and state

This provides complete authentication restoration.

### Multiple Accounts

Manage multiple accounts easily:

```javascript
const sessionManager = new SessionManager()

// Save sessions for different accounts
await sessionManager.saveSession('work-account', workContext)
await sessionManager.saveSession('personal-account', personalContext)

// List all sessions
const sessions = await sessionManager.listSessions()
console.log('Available accounts:', sessions)
// ['work-account', 'personal-account']

// Switch between accounts
const workCtx = await sessionManager.loadSession('work-account', browser)
const personalCtx = await sessionManager.loadSession('personal-account', browser)
```

### Session Lifecycle

```javascript
const sessionManager = new SessionManager()

// Create
await sessionManager.saveSession('user123', context)

// Check
if (sessionManager.hasSession('user123')) {
  console.log('Session exists')
}

// Use
const context = await sessionManager.loadSession('user123', browser)

// Delete
await sessionManager.deleteSession('user123')
```

## Complete Login Helper

The `login()` helper combines everything:

```javascript
import { login, SessionManager } from 'domharvest-playwright'

const sessionManager = new SessionManager()

await login(
  page,
  'https://example.com/login',
  {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  },
  {
    // Custom selectors (optional)
    selectors: {
      usernameSelector: '#email',
      passwordSelector: '#password',
      submitSelector: '.btn-login'
    },

    // Save session
    sessionId: 'myaccount',
    sessionManager,

    // Or save cookies only
    cookiesPath: './cookies.json',

    // Verify success
    successSelector: '.user-dashboard',

    // Timeout
    timeout: 30000
  }
)
```

## Real-World Examples

### Example 1: GitHub Scraping

```javascript
import { DOMHarvester, SessionManager, login, text, attr } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: false })
const sessionManager = new SessionManager({ storageDir: './github-sessions' })

await harvester.init()

try {
  // Check for existing session
  if (!sessionManager.hasSession('github-user')) {
    // First time: login
    const page = await harvester.context.newPage()

    await login(
      page,
      'https://github.com/login',
      {
        username: process.env.GITHUB_USERNAME,
        password: process.env.GITHUB_PASSWORD
      },
      {
        sessionId: 'github-user',
        sessionManager,
        successSelector: '[aria-label="View profile and more"]',
        selectors: {
          usernameSelector: '#login_field',
          passwordSelector: '#password'
        }
      }
    )

    await page.close()
  } else {
    // Load existing session
    await harvester.context.close()
    harvester.context = await sessionManager.loadSession('github-user', harvester.browser)
  }

  // Scrape private repos
  const repos = await harvester.harvest(
    'https://github.com/user?tab=repositories',
    '[data-hovercard-type="repository"]',
    {
      name: text('a[itemprop="name codeRepository"]'),
      url: attr('a[itemprop="name codeRepository"]', 'href'),
      isPrivate: exists('.Label--private'),
      language: text('[itemprop="programmingLanguage"]', { default: 'N/A' })
    }
  )

  console.log(`Found ${repos.length} repositories`)
  console.log(repos)
} finally {
  await harvester.close()
}
```

### Example 2: Multi-Account Scraping

```javascript
import { DOMHarvester, SessionManager } from 'domharvest-playwright'

async function scrapeWithAccount(accountId, sessionManager) {
  const harvester = new DOMHarvester()
  await harvester.init()

  try {
    // Load account session
    await harvester.context.close()
    harvester.context = await sessionManager.loadSession(accountId, harvester.browser)

    // Scrape account-specific data
    const data = await harvester.harvest(
      'https://example.com/dashboard',
      '.data-item',
      { /* ... */ }
    )

    return { account: accountId, data }
  } finally {
    await harvester.close()
  }
}

// Scrape multiple accounts
const sessionManager = new SessionManager()
const accounts = await sessionManager.listSessions()

const results = []
for (const account of accounts) {
  const result = await scrapeWithAccount(account, sessionManager)
  results.push(result)
}

console.log('Scraped data from', results.length, 'accounts')
```

### Example 3: Session Refresh

Handle expired sessions automatically:

```javascript
import { DOMHarvester, SessionManager, login } from 'domharvest-playwright'

async function scrapeWithRefresh(url, sessionId, credentials) {
  const harvester = new DOMHarvester({ headless: true })
  const sessionManager = new SessionManager()

  await harvester.init()

  try {
    // Try loading existing session
    if (sessionManager.hasSession(sessionId)) {
      await harvester.context.close()
      harvester.context = await sessionManager.loadSession(sessionId, harvester.browser)

      const page = await harvester.context.newPage()
      await page.goto(url)

      // Check if still logged in
      const isLoggedIn = await page.$('.user-profile')

      if (!isLoggedIn) {
        console.log('Session expired, re-authenticating...')
        await sessionManager.deleteSession(sessionId)
        await harvester.context.close()

        // Re-login
        harvester.context = await harvester.browser.newContext()
        const loginPage = await harvester.context.newPage()

        await login(loginPage, 'https://example.com/login', credentials, {
          sessionId,
          sessionManager,
          successSelector: '.user-profile'
        })

        await loginPage.close()
      }
    } else {
      // No session, login
      const page = await harvester.context.newPage()
      await login(page, 'https://example.com/login', credentials, {
        sessionId,
        sessionManager,
        successSelector: '.user-profile'
      })
      await page.close()
    }

    // Now scrape
    return await harvester.harvest(url, '.item', { /* ... */ })
  } finally {
    await harvester.close()
  }
}

// Usage
const data = await scrapeWithRefresh(
  'https://example.com/data',
  'myaccount',
  { username: process.env.USER, password: process.env.PASS }
)
```

## Security Best Practices

### 1. Never Hardcode Credentials

❌ **Bad:**
```javascript
await login(page, url, {
  username: 'myemail@example.com',
  password: 'mypassword123'
})
```

✅ **Good:**
```javascript
await login(page, url, {
  username: process.env.APP_USERNAME,
  password: process.env.APP_PASSWORD
})
```

Use `.env` file:
```bash
# .env
APP_USERNAME=user@example.com
APP_PASSWORD=securepassword

# Load with dotenv
npm install dotenv
```

```javascript
import 'dotenv/config'

// Now use process.env
```

### 2. Secure Session Storage

Store sessions outside version control:

```javascript
// .gitignore
sessions/
cookies.json
.env
```

### 3. Handle 2FA

For sites with 2FA, use manual intervention:

```javascript
const harvester = new DOMHarvester({ headless: false }) // Show browser

await fillLoginForm(page, credentials)

// Pause for manual 2FA
console.log('Please complete 2FA in the browser...')
await page.waitForSelector('.dashboard', { timeout: 120000 }) // 2 min

// Save session after 2FA
await sessionManager.saveSession('account-with-2fa', context)
```

### 4. Rotate Sessions

Delete old sessions periodically:

```javascript
const MAX_SESSION_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

async function cleanOldSessions(sessionManager) {
  const sessions = await sessionManager.listSessions()

  for (const sessionId of sessions) {
    const sessionPath = join(sessionManager.storageDir, `${sessionId}.json`)
    const stats = statSync(sessionPath)
    const age = Date.now() - stats.mtimeMs

    if (age > MAX_SESSION_AGE) {
      await sessionManager.deleteSession(sessionId)
      console.log(`Deleted old session: ${sessionId}`)
    }
  }
}
```

## Troubleshooting

### Login Not Working

1. **Check selectors** - Inspect the login form and verify selectors match
2. **Add delays** - Some sites need time between field fills:
   ```javascript
   await page.fill('#username', credentials.username)
   await page.waitForTimeout(1000)
   await page.fill('#password', credentials.password)
   await page.click('#submit')
   ```
3. **Disable headless** - Run with `headless: false` to see what's happening
4. **Check for CAPTCHAs** - Some sites require human verification

### Session Expired

Sessions can expire. Always verify:

```javascript
const context = await sessionManager.loadSession('user', browser)
const page = await context.newPage()
await page.goto(url)

// Verify logged in
try {
  await page.waitForSelector('.user-profile', { timeout: 5000 })
} catch (error) {
  console.log('Session expired, please re-login')
  await sessionManager.deleteSession('user')
}
```

### Cookies Not Persisting

Ensure cookies are saved after navigation completes:

```javascript
await fillLoginForm(page, credentials)
await page.waitForNavigation() // Wait for redirect
await saveCookies(context, './cookies.json')
```

## Advanced Patterns

### Lazy Session Loading

Load sessions on-demand:

```javascript
class AuthenticatedHarvester {
  constructor(sessionId, credentials) {
    this.sessionId = sessionId
    this.credentials = credentials
    this.sessionManager = new SessionManager()
    this.harvester = null
  }

  async init() {
    this.harvester = new DOMHarvester({ headless: true })
    await this.harvester.init()

    if (this.sessionManager.hasSession(this.sessionId)) {
      await this.harvester.context.close()
      this.harvester.context = await this.sessionManager.loadSession(
        this.sessionId,
        this.harvester.browser
      )
    } else {
      await this.login()
    }
  }

  async login() {
    const page = await this.harvester.context.newPage()
    await login(page, 'https://example.com/login', this.credentials, {
      sessionId: this.sessionId,
      sessionManager: this.sessionManager
    })
    await page.close()
  }

  async scrape(url, selector, extractor) {
    return await this.harvester.harvest(url, selector, extractor)
  }

  async close() {
    await this.harvester.close()
  }
}

// Usage
const scraper = new AuthenticatedHarvester('account1', {
  username: process.env.USER,
  password: process.env.PASS
})

await scraper.init()
const data = await scraper.scrape(url, selector, extractor)
await scraper.close()
```

## Next Steps

- Check [Authentication API Reference](/api/authentication) for complete API docs
- See [Configuration Guide](/guide/configuration) for cookie options
- Explore [Examples](/guide/examples) for more patterns

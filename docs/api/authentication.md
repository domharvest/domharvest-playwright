# Authentication API Reference

Complete API reference for DOMHarvest's authentication and session management helpers.

## Import

```javascript
import {
  fillLoginForm,
  saveCookies,
  loadCookies,
  SessionManager,
  login
} from 'domharvest-playwright'
```

## fillLoginForm()

Fill and submit a login form with automatic field detection.

### Signature

```typescript
async function fillLoginForm(
  page: Page,
  credentials: Credentials,
  selectors?: FormSelectors,
  options?: FormOptions
): Promise<void>
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | `Page` | Yes | - | Playwright page instance |
| `credentials` | `Credentials` | Yes | - | Login credentials object |
| `credentials.username` | `string` | Yes | - | Username or email |
| `credentials.password` | `string` | Yes | - | Password |
| `selectors` | `FormSelectors` | No | Auto-detect | Custom form field selectors |
| `selectors.usernameSelector` | `string` | No | `'input[name="username"], input[type="email"], input[name="email"]'` | Username field selector |
| `selectors.passwordSelector` | `string` | No | `'input[name="password"], input[type="password"]'` | Password field selector |
| `selectors.submitSelector` | `string` | No | `'button[type="submit"], input[type="submit"]'` | Submit button selector |
| `options` | `FormOptions` | No | `{}` | Additional options |
| `options.timeout` | `number` | No | `30000` | Timeout in milliseconds |
| `options.waitForNavigation` | `boolean` | No | `true` | Wait for navigation after submit |

### Returns

`Promise<void>`

### Throws

- `Error` - If form fields are not found or submission fails

### Examples

```javascript
// Auto-detect form fields
await fillLoginForm(page, {
  username: 'user@example.com',
  password: 'password123'
})

// Custom selectors
await fillLoginForm(
  page,
  { username: 'user@example.com', password: 'password123' },
  {
    usernameSelector: '#email',
    passwordSelector: '#pwd',
    submitSelector: '#login-btn'
  }
)

// Don't wait for navigation
await fillLoginForm(
  page,
  { username: 'user', password: 'pass' },
  {},
  { waitForNavigation: false }
)
```

---

## saveCookies()

Save browser cookies to a file or return as array.

### Signature

```typescript
async function saveCookies(
  context: BrowserContext,
  filePath?: string
): Promise<Cookie[]>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `context` | `BrowserContext` | Yes | Browser context |
| `filePath` | `string` | No | Optional file path to save cookies |

### Returns

`Promise<Cookie[]>` - Array of cookie objects

### Examples

```javascript
// Save to file
await saveCookies(context, './cookies.json')

// Get as array
const cookies = await saveCookies(context)
console.log(cookies)
```

---

## loadCookies()

Load cookies from a file or array into browser context.

### Signature

```typescript
async function loadCookies(
  context: BrowserContext,
  cookiesOrPath: string | Cookie[]
): Promise<void>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `context` | `BrowserContext` | Yes | Browser context |
| `cookiesOrPath` | `string \| Cookie[]` | Yes | Path to cookies file or array of cookies |

### Returns

`Promise<void>`

### Throws

- `Error` - If file not found or invalid format

### Examples

```javascript
// Load from file
await loadCookies(context, './cookies.json')

// Load from array
await loadCookies(context, [
  {
    name: 'session',
    value: 'abc123',
    domain: '.example.com',
    path: '/'
  }
])
```

---

## SessionManager

Manages persistent authentication sessions with automatic storage.

### Constructor

```typescript
new SessionManager(options?: SessionOptions)
```

#### Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.storageDir` | `string` | `'./sessions'` | Directory to store session files |

### Methods

#### saveSession()

Save complete session state including cookies and storage.

```typescript
async saveSession(
  sessionId: string,
  context: BrowserContext
): Promise<string>
```

**Parameters:**
- `sessionId` - Unique session identifier
- `context` - Browser context to save

**Returns:** Path to saved session file

**Example:**
```javascript
const sessionManager = new SessionManager()
await sessionManager.saveSession('user123', context)
```

#### loadSession()

Load session and create new context with saved state.

```typescript
async loadSession(
  sessionId: string,
  browser: Browser
): Promise<BrowserContext>
```

**Parameters:**
- `sessionId` - Session identifier
- `browser` - Browser instance

**Returns:** New browser context with loaded session

**Throws:** Error if session not found

**Example:**
```javascript
const context = await sessionManager.loadSession('user123', browser)
```

#### hasSession()

Check if session exists.

```typescript
hasSession(sessionId: string): boolean
```

**Parameters:**
- `sessionId` - Session identifier

**Returns:** `true` if session exists

**Example:**
```javascript
if (sessionManager.hasSession('user123')) {
  context = await sessionManager.loadSession('user123', browser)
}
```

#### deleteSession()

Delete session file.

```typescript
async deleteSession(sessionId: string): Promise<boolean>
```

**Parameters:**
- `sessionId` - Session identifier

**Returns:** `true` if session was deleted

**Example:**
```javascript
await sessionManager.deleteSession('user123')
```

#### listSessions()

List all available sessions.

```typescript
async listSessions(): Promise<string[]>
```

**Returns:** Array of session IDs

**Example:**
```javascript
const sessions = await sessionManager.listSessions()
console.log('Available sessions:', sessions)
```

### Complete Example

```javascript
import { chromium, SessionManager } from 'domharvest-playwright'

const browser = await chromium.launch()
const sessionManager = new SessionManager({ storageDir: './auth-sessions' })

// First time: login and save session
if (!sessionManager.hasSession('myaccount')) {
  const context = await browser.newContext()
  const page = await context.newPage()

  // Perform login
  await page.goto('https://example.com/login')
  // ... fill form ...

  await sessionManager.saveSession('myaccount', context)
  await context.close()
}

// Next time: load existing session
const context = await sessionManager.loadSession('myaccount', browser)
const page = await context.newPage()
await page.goto('https://example.com/dashboard')
// Already logged in!
```

---

## login()

High-level helper that combines navigation, form filling, and session saving.

### Signature

```typescript
async function login(
  page: Page,
  loginUrl: string,
  credentials: Credentials,
  options?: LoginOptions
): Promise<void>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `Page` | Yes | Playwright page instance |
| `loginUrl` | `string` | Yes | URL of login page |
| `credentials` | `Credentials` | Yes | Login credentials |
| `credentials.username` | `string` | Yes | Username or email |
| `credentials.password` | `string` | Yes | Password |
| `options` | `LoginOptions` | No | Additional options |
| `options.selectors` | `FormSelectors` | No | Custom form selectors |
| `options.sessionId` | `string` | No | Session ID for saving |
| `options.sessionManager` | `SessionManager` | No | SessionManager instance |
| `options.cookiesPath` | `string` | No | Path to save cookies |
| `options.successSelector` | `string` | No | Selector to verify login success |
| `options.timeout` | `number` | No | `30000` | Timeout in milliseconds |

### Returns

`Promise<void>`

### Examples

```javascript
// Basic login
await login(
  page,
  'https://example.com/login',
  { username: 'user@example.com', password: 'pass123' }
)

// Login with session manager
const sessionManager = new SessionManager()
await login(
  page,
  'https://example.com/login',
  { username: 'user@example.com', password: 'pass123' },
  {
    sessionId: 'myuser',
    sessionManager,
    successSelector: '.user-profile'
  }
)

// Login with cookies
await login(
  page,
  'https://example.com/login',
  { username: 'user', password: 'pass' },
  {
    cookiesPath: './my-cookies.json',
    successSelector: '.dashboard'
  }
)

// Custom selectors
await login(
  page,
  'https://example.com/login',
  { username: 'user', password: 'pass' },
  {
    selectors: {
      usernameSelector: '#email',
      passwordSelector: '#password',
      submitSelector: '.login-button'
    }
  }
)
```

---

## Integration with DOMHarvester

Authentication helpers work seamlessly with DOMHarvester:

```javascript
import { DOMHarvester, SessionManager, login } from 'domharvest-playwright'

const harvester = new DOMHarvester({ headless: true })
const sessionManager = new SessionManager()

await harvester.init()

try {
  // Check for existing session
  if (sessionManager.hasSession('github')) {
    // Load session into harvester's context
    await harvester.context.close()
    harvester.context = await sessionManager.loadSession('github', harvester.browser)
  } else {
    // Login and save session
    const page = await harvester.context.newPage()
    await login(
      page,
      'https://github.com/login',
      { username: 'user', password: 'pass' },
      {
        sessionId: 'github',
        sessionManager,
        successSelector: '.Header-link[aria-label="View profile and more"]'
      }
    )
    await page.close()
  }

  // Now scrape authenticated content
  const repos = await harvester.harvest(
    'https://github.com/user/repos',
    '.repo-list-item',
    {
      name: text('.repo'),
      private: exists('.Label--private')
    }
  )

  console.log(repos)
} finally {
  await harvester.close()
}
```

---

## Type Definitions

```typescript
interface Credentials {
  username: string
  password: string
}

interface FormSelectors {
  usernameSelector?: string
  passwordSelector?: string
  submitSelector?: string
}

interface FormOptions {
  timeout?: number
  waitForNavigation?: boolean
}

interface SessionOptions {
  storageDir?: string
}

interface LoginOptions {
  selectors?: FormSelectors
  sessionId?: string
  sessionManager?: SessionManager
  cookiesPath?: string
  successSelector?: string
  timeout?: number
}

interface Cookie {
  name: string
  value: string
  domain: string
  path: string
  expires?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}
```

---

## Best Practices

### 1. Use SessionManager for Persistent Authentication

SessionManager is the recommended way to handle authentication:

```javascript
const sessionManager = new SessionManager({ storageDir: './sessions' })

// Login once
if (!sessionManager.hasSession('user')) {
  // ... perform login ...
  await sessionManager.saveSession('user', context)
}

// Reuse session
const context = await sessionManager.loadSession('user', browser)
```

### 2. Verify Successful Login

Always verify login succeeded before proceeding:

```javascript
await login(page, loginUrl, credentials, {
  successSelector: '.user-dashboard', // Element that only appears when logged in
  timeout: 30000
})
```

### 3. Handle Session Expiration

Check and refresh sessions periodically:

```javascript
const context = await sessionManager.loadSession('user', browser)
const page = await context.newPage()

try {
  await page.goto('https://example.com/dashboard')
  await page.waitForSelector('.user-profile', { timeout: 5000 })
} catch (error) {
  // Session expired, re-login
  await sessionManager.deleteSession('user')
  // ... perform fresh login ...
}
```

### 4. Secure Credential Storage

Never hardcode credentials in production:

```javascript
// Good - use environment variables
await login(page, loginUrl, {
  username: process.env.APP_USERNAME,
  password: process.env.APP_PASSWORD
})

// Bad - hardcoded credentials
await login(page, loginUrl, {
  username: 'myemail@example.com',
  password: 'mypassword123'
})
```

### 5. Clean Up Sessions

Delete sessions when no longer needed:

```javascript
// After scraping
await sessionManager.deleteSession('tempuser')

// Or list and clean old sessions
const sessions = await sessionManager.listSessions()
for (const session of sessions) {
  if (isOldSession(session)) {
    await sessionManager.deleteSession(session)
  }
}
```

---

## See Also

- [Authentication Guide](/guide/authentication) - Comprehensive authentication guide
- [Configuration](/guide/configuration) - Cookie and context configuration
- [DOMHarvester API](/api/harvester) - Core harvester methods

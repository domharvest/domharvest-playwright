import { defineConfig } from 'vitepress'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
)

export default defineConfig({
  title: 'DOMHarvest Playwright',
  description: 'A powerful DOM harvesting tool built with Playwright',
  base: '/domharvest-playwright/',
  head: [
    [
      'script',
      {
        'data-goatcounter': 'https://domharvest.goatcounter.com/count',
        'async': '',
        'src': '//gc.zgo.at/count.js'
      }
    ]
  ],
  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/harvester' },
      {
        text: `v${packageJson.version}`,
        link: 'https://github.com/domharvest/domharvest-playwright/releases'
      },
      { text: 'GitHub', link: 'https://github.com/domharvest/domharvest-playwright' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' }
          ]
        },
        {
          text: 'Usage',
          items: [
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Examples', link: '/guide/examples' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'DOMHarvester', link: '/api/harvester' },
            { text: 'Helper Functions', link: '/api/helpers' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/domharvest/domharvest-playwright' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Massimiliano Bertinetti'
    }
  }
})

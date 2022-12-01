const { defineConfig } = require('cypress')

module.exports = defineConfig({
  host: 'https://test.seven23.io',
  projectId: 'sutkxf',
  numTestsKeptInMemory: 1,
  video: true,
  defaultCommandTimeout: 10000,
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('../plugins/index.js')(on, config)
    },
    baseUrl: "http://127.0.0.1:8080",
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})

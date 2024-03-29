const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'zq7hgu',
  e2e: {
    setupNodeEvents(on, config) {},
    supportFile: false,
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})

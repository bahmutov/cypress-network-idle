/// <reference path="./index.d.ts" />

require('./index')

/**
 * Overwrites the cy.visit command to wait for all network requests to finish.
 * Options object can have "timeout" (ms) and "log" (boolean) properties.
 * @example registerVisit({ timeout: 1000, log: false })
 */
function registerVisit(options = {}) {
  const timeout = 'timeout' in options ? options.timeout : 1000
  const log = 'log' in options ? options.log : true

  Cypress.Commands.overwrite('visit', (visit, ...args) => {
    cy.waitForNetworkIdlePrepare({
      method: '*',
      alias: 'visit',
      pattern: '**',
      log,
    })
    visit(...args)
    cy.waitForNetworkIdle('@visit', timeout)
  })
}

module.exports = { registerVisit }

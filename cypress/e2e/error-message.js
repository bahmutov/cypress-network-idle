/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

it('times out and throw an error', () => {
  cy.waitForNetworkIdlePrepare({
    method: 'GET',
    alias: 'visit',
    pattern: '/after/*',
  })

  cy.visit('/busy-page')

  // do not give the page enough time to finish all network calls
  // enable to see the error message
  const timeout = 2000
  // const timeout = 5000
  cy.waitForNetworkIdle('@visit', 1000, { timeout })
})

/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

beforeEach(() => {
  cy.waitForNetworkIdlePrepare({
    method: '*',
    alias: 'all',
    pattern: '**',
  })
})

it('waits for the pending network call', () => {
  cy.intercept('GET', /\/after\/\d+$/).as('after')
  cy.visit('/after', {
    onBeforeLoad(win) {
      win.fetch('/after/3000')
    },
  })

  // there is 1 pending network call that goes on for 3 seconds
  // after that we wait for 2 seconds of network idle
  cy.waitForNetworkIdle('@all', 2000, { timeout: 6000 })
    .should('have.keys', 'started', 'finished', 'waited', 'callCount')
    .then(({ waited, callCount }) => {
      // the page makes the Ajax call that resolves after 3 seconds
      // with 2 seconds of checking for network idle makes 5 seconds
      expect(waited, 'waited ms').to.be.within(5000, 6000)
      // the document and the Ajax
      expect(callCount, 'callCount').to.equal(2)
    })

  // confirm the /after/x call took N seconds
  cy.wait('@after')
  cy.window()
    .its('performance')
    .invoke('getEntriesByName', 'http://localhost:3000/after/3000')
    .should('have.length', 1)
    .its('0.duration', { timeout: 0 })
    .should('be.within', 3000, 3100)
})

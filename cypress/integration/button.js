/// <reference path="../../src/index.d.ts" />

import('../../src')

it('starts listening before', () => {
  cy.visit('/button')
  cy.waitForNetworkIdlePrepare({
    method: 'GET',
    pattern: '/user',
    alias: 'user',
  })
  cy.get('#fetch').click()
  cy.waitForNetworkIdle('@user', 1000)
    .should('have.keys', 'started', 'finished', 'waited', 'callCount')
    .then(({ waited, callCount }) => {
      expect(callCount, 'callCount').to.equal(1)
      // the expected time is a little tricky, since it might have
      // finished _before_ the cy.waitForNetworkIdle was called
      // so let's give it a range around the 1 second mark
      expect(waited, 'waited').to.be.within(800, 1200)
    })
})

/// <reference types="cypress" />

import('../..')

it('waits for the network call', () => {
  cy.visit('cypress/index.html')

  cy.waitForNetworkIdle(2000)
    .should('have.keys', 'started', 'finished', 'waited', 'callCount')
    .then(({ waited, callCount }) => {
      // the page makes the second Ajax call after 1500 ms
      // thus total resolve time should be >= 3500 ms
      // but probably under 4 seconds
      expect(waited, 'waited ms').to.be.within(3500, 4000)
      expect(callCount, 'callCount').to.equal(2)
    })
})

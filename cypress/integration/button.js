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
  // cy.waitForNetworkIdle('/user', 1000)
  //   .should('have.keys', 'started', 'finished', 'waited', 'callCount')
  //   .then(({ waited, callCount }) => {
  //     expect(callCount, 'callCount').to.equal(1)
  //   })
})

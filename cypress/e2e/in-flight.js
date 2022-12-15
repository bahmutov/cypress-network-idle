/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

// https://github.com/bahmutov/cypress-network-idle/issues/66
it(
  'waits for the inflight request',
  { viewportHeight: 300, viewportWidth: 500 },
  () => {
    cy.visit('/after')
    cy.get('#fetch-delay').clear().type(String(1000))

    cy.waitForNetworkIdlePrepare({
      method: 'GET',
      pattern: '/after/*',
      alias: 'after',
    })
    cy.get('#fetch').click().wait(100)
    // by the time we start waiting, the network request is already out
    cy.waitForNetworkIdle('@after', 1000).then(({ waited, callCount }) => {
      expect(callCount, 'callCount').to.equal(1)
      expect(waited, 'waited').to.be.within(2000, 2500)
    })
  },
)

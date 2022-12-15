/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../../src'

it(
  'waits for the request that starts later',
  { viewportHeight: 300, viewportWidth: 500 },
  () => {
    cy.visit('/after')
    cy.get('#fetch-delay').clear().type(String(1000))
    cy.get('#server-delay').clear().type(String(1000))

    cy.waitForNetworkIdlePrepare({
      method: 'GET',
      pattern: '/after/*',
      alias: 'after',
    })
    cy.get('#fetch').click()
    // by the time we start waiting, the network request is already out
    cy.waitForNetworkIdle('@after', 1100).then(({ waited, callCount }) => {
      expect(callCount, 'callCount').to.equal(1)
      // call starts after 1000ms
      // call lasts 1000ms
      // plus idle wait for 1100ms
      // together between 3100 and 3200ms
      expect(waited, 'waited').to.be.within(3100, 3500)
    })
  },
)

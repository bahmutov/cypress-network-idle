/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

it('waits 9 seconds', () => {
  cy.waitForNetworkIdlePrepare({
    method: 'GET',
    pattern: '/after/*',
    alias: 'ajax',
  })
  cy.visit('/four-seconds')
  cy.contains('h1', 'cypress-network-idle page')
  cy.waitForNetworkIdle('@ajax', 5000).then(({ waited, callCount }) => {
    expect(callCount, 'calls').to.equal(1)
    expect(waited, 'waited about 9 seconds').to.be.within(9000, 9500)
  })
})

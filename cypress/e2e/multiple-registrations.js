/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

function getIntercepts() {
  return cy
    .wrap(Cypress.env())
    .then(Object.keys)
    .then((list) => {
      return list.filter((key) => key.startsWith('networkIdleCounters_'))
    })
}

it('registers once', () => {
  cy.visit('/button')
  getIntercepts().should('have.length', 0)
  cy.waitForNetworkIdlePrepare({
    method: 'GET',
    pattern: '/user',
    alias: 'user',
  })
  cy.waitForNetworkIdlePrepare({
    method: 'GET',
    pattern: '/user',
    alias: 'user',
  })
  cy.waitForNetworkIdlePrepare({
    method: 'GET',
    pattern: '/user',
    alias: 'user',
  })
  getIntercepts().should('have.length', 1)
  cy.get('#fetch').click()
  cy.waitForNetworkIdle('@user', 1000).then(({ callCount, waited }) => {
    expect(callCount, 'call count').to.equal(1)
    expect(waited, 'waited ms').to.be.above(1000)
  })
  getIntercepts().should('have.length', 1)
})

/// <reference path="../../src/index.d.ts" />

import('../../src')

describe('button delay', { viewportHeight: 300, viewportWidth: 500 }, () => {
  it('waits for call that takes one second', () => {
    cy.visit('/button')
    cy.get('#fetch-delay').clear().type(1000)
    cy.waitForNetworkIdlePrepare({
      method: 'GET',
      pattern: '/user',
      alias: 'user',
    })

    cy.get('#fetch').click()
    cy.waitForNetworkIdle('@user', 1000).then(({ waited, callCount }) => {
      expect(callCount, 'callCount').to.equal(1)
      expect(waited, 'waited').to.be.within(2000, 2500)
    })
  })
})

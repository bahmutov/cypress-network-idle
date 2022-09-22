/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

describe('Waiting for POST requests', () => {
  it('ignores the GET requests', () => {
    // listen to all POST calls
    cy.waitForNetworkIdlePrepare({
      method: 'POST',
      pattern: '*',
      alias: 'postCalls',
    })

    cy.visit('/get-vs-post')
    cy.waitForNetworkIdle('@postCalls', 2000).then(({ waited, callCount }) => {
      expect(callCount, 'call count').to.equal(1)
      expect(waited, 'waited period').to.be.within(3500, 4500)
    })
  })

  it('waits for specific POST route only', () => {
    // listen to "POST /add-user" calls
    cy.waitForNetworkIdlePrepare({
      method: 'POST',
      pattern: '/add-user',
      alias: 'addUser',
    })

    cy.visit('/get-vs-post')
    cy.waitForNetworkIdle('@addUser', 2000).then(({ waited, callCount }) => {
      expect(callCount, 'call count').to.equal(1)
      expect(waited, 'waited period').to.be.within(3500, 4500)
    })
  })
})

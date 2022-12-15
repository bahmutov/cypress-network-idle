/// <reference path="../../src/index.d.ts" />

import('../../src')

describe('button', { viewportHeight: 300, viewportWidth: 500 }, () => {
  it('starts listening before', () => {
    cy.visit('/button')
    cy.waitForNetworkIdlePrepare({
      method: '*',
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
        expect(waited, 'waited').to.be.within(800, 1500)
      })
  })

  it('stubs with a fixture', () => {
    cy.intercept('GET', '/user', { fixture: 'user.json' })
    cy.visit('/button')
    cy.waitForNetworkIdlePrepare({
      method: 'GET',
      pattern: '/user',
      alias: 'user',
    })
    cy.get('#fetch').click()

    cy.waitForNetworkIdle('@user', 1000)
    cy.window().its('user').should('deep.equal', { name: 'Test User' })
  })
})

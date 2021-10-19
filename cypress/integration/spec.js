/// <reference path="../../src/index.d.ts" />

import '../..'

it('waits for the network call', () => {
  cy.visit('/')

  cy.waitForNetworkIdle(2000)
    .should('have.keys', 'started', 'finished', 'waited', 'callCount')
    .then(({ waited, callCount }) => {
      // the page makes the Ajax call after 1000 ms
      // thus total resolve time should be >= 3000 ms
      // but probably under 4 seconds
      expect(waited, 'waited ms').to.be.within(3000, 4000)
      expect(callCount, 'callCount').to.equal(1)
    })
})

it('spy works', () => {
  cy.intercept('GET', '**/user').as('testUser')
  cy.visit('/')
  cy.wait('@testUser')
})

it('can spy separately', () => {
  cy.intercept('GET', '**/user').as('testUser')
  cy.visit('/')
  cy.wait('@testUser')

  cy.waitForNetworkIdle(2000)
    .should('have.keys', 'started', 'finished', 'waited', 'callCount')
    .then(({ waited, callCount }) => {
      // since we already waited for the Ajax call
      // we finish without any more calls
      expect(waited, 'waited ms').to.be.within(2000, 2200)
      expect(callCount, 'callCount').to.equal(0)
    })
})

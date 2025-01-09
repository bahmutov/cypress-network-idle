/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

it('waits for the network call', () => {
  cy.visit('/')

  cy.waitForNetworkIdle(4000)
    .should('have.keys', 'started', 'finished', 'waited', 'callCount')
    .then(({ waited, callCount }) => {
      // the page makes the Ajax call after 1000 ms
      // thus total resolve time should be >= 3000 ms
      // but probably under 4 seconds
      expect(waited, 'waited ms').to.be.within(3000, 4000)
      expect(callCount, 'callCount').to.equal(1)
    })
})

it('waits for all the network call methods using a pattern', () => {
  cy.visit('/')

  cy.waitForNetworkIdle('*', 2000)
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

it('the spy on stubbed call', () => {
  cy.intercept('GET', '**/user', { name: 'John Doe' }).as('testUser')
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

it('stubs with an object', () => {
  cy.intercept('GET', '/user', { name: 'Test User' })
  cy.visit('/')
  cy.waitForNetworkIdle('*', '/user', 1100)
  cy.window().its('user').should('deep.equal', { name: 'Test User' })
})

it('stubs with a fixture', () => {
  cy.intercept('GET', '/user', { fixture: 'user.json' })
  cy.visit('/')
  cy.waitForNetworkIdle('*', '/user', 1100)
  cy.window().its('user').should('deep.equal', { name: 'Test User' })
})

it('no logging', () => {
  cy.intercept('GET', '/user', { name: 'Test User' })
  cy.visit('/')
  // by default, we log additional information when waiting
  // you can disable logging by explicitly passing `{ log: false }`
  cy.waitForNetworkIdle('*', '/user', 1100, { log: false })
  cy.window().its('user').should('deep.equal', { name: 'Test User' })
})

it('waits for up to a minute', () => {
  cy.intercept('GET', '/user', { name: 'Test User' })
  cy.visit('/')
  cy.waitForNetworkIdle('*', '/user', 1100, { timeout: 60_000 })
  cy.window().its('user').should('deep.equal', { name: 'Test User' })
})

/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

// test for multiple registrations
// https://github.com/bahmutov/cypress-network-idle/issues/54

it('stubs test 1', () => {
  cy.visit('/button')
  cy.waitForNetworkIdlePrepare({
    method: '*',
    pattern: '/user',
    alias: 'user',
  })
  cy.get('#fetch').click()
  cy.waitForNetworkIdle('@user', 1000).its('callCount').should('equal', 1)
})

it('stubs test 2', () => {
  cy.visit('/button')
  cy.waitForNetworkIdlePrepare({
    method: '*',
    pattern: '/user',
    alias: 'user',
  })
  cy.get('#fetch').click()
  cy.waitForNetworkIdle('@user', 1000).its('callCount').should('equal', 1)
})

it('stubs test 3', () => {
  cy.visit('/button')
  cy.waitForNetworkIdlePrepare({
    method: '*',
    pattern: '/user',
    alias: 'user',
  })
  cy.get('#fetch').click()
  cy.waitForNetworkIdle('@user', 1000).its('callCount').should('equal', 1)
})

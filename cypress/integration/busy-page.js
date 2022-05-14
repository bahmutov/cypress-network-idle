/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

Cypress.Commands.overwrite('visit', (visit, ...args) => {
  cy.waitForNetworkIdlePrepare({
    method: '*',
    alias: 'visit',
    pattern: '**',
  })
  visit(...args)
  cy.waitForNetworkIdle('@visit', 1000)
})

it('waits for the page to load its Ajax requests', () => {
  cy.intercept('GET', /\/after\/\d+$/).as('after')
  cy.visit('/busy-page')
})

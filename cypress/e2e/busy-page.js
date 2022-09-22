/// <reference path="../../src/index.d.ts" />
// @ts-check

const { registerVisit } = require('../../src/register')
registerVisit({ timeout: 1000 })

it('waits for the page to load its Ajax requests', () => {
  cy.intercept('GET', /\/after\/\d+$/).as('after')
  cy.visit('/busy-page')
})

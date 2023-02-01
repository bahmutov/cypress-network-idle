/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../../src'

// fails the test on 401 response code
it('fails the test when a request receives 401 status code', () => {
  cy.on('fail', (e) => {
    if (e.message.includes('failed with 401')) {
      console.log('expected error')
      return false
    } else {
      throw e
    }
  })

  // fail the test if any of the matching calls
  // returns a 4xx status code
  cy.waitForNetworkIdlePrepare({
    method: '*',
    alias: 'all',
    pattern: '**',
    failOn4xx: true,
  })

  cy.visit('/fail-500')
    .wait(2000)
    .then(() => {
      // the network should have caught an 5xx error
      throw new Error('Should never get here')
    })
})

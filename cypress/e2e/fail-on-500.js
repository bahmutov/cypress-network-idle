/// <reference path="../../src/index.d.ts" />
// @ts-check

import '../..'

// fails the test on 500 response code, but not on 401
it('fails the test when a request receives 500 status code', () => {
  cy.on('fail', (e) => {
    if (e.message.includes('failed with 500')) {
      console.log('expected error')
      return false
    } else {
      throw e
    }
  })

  // fail the test if any of the matching calls
  // returns a 5xx status code
  cy.waitForNetworkIdlePrepare({
    method: '*',
    alias: 'all',
    pattern: '**',
    failOn5xx: true,
  })

  cy.visit('/fail-500')
    .wait(3000)
    .then(() => {
      // the network should have caught an 5xx error
      throw new Error('Should never get here')
    })
})

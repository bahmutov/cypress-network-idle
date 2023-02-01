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

it('fails and formats the message', () => {
  cy.on('fail', (e) => {
    if (
      e.message.includes('failed with 401') &&
      e.message.includes('(x flag abc123)')
    ) {
      console.log('expected error')
      return false
    } else {
      throw e
    }
  })

  // fail the test if any of the matching calls
  // returns a 5xx status code
  cy.waitForNetworkIdlePrepare({
    method: 'POST',
    alias: 'post',
    pattern: '/status-401',
    failOn(req, res) {
      if (res.statusCode === 401) {
        return `Call ${req.method} ${req.url} (x flag ${req.headers['x-my-flag']}) failed with ${res.statusCode}`
      }
    },
  })

  cy.visit('/fail-500')
    .its('fetch')
    .then((fetch) => {
      fetch('/status-401', {
        method: 'POST',
        headers: {
          'x-my-flag': 'abc123',
        },
      })
    })
    .wait(3000)
    .then(() => {
      // the network should have caught an 5xx error
      throw new Error('Should never get here')
    })
})

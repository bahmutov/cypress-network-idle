/// <reference path="../../src/index.d.ts" />

import('../../src')

it('uses the response timestamp', () => {
  cy.visit('/delayed')

  cy.waitForNetworkIdle('GET', '/user/delayed', 3000)
    .should('have.keys', 'started', 'finished', 'waited', 'callCount')
    .then(({ waited, callCount }) => {
      // the page makes an Ajax call after 1500 ms
      // which is delayed by 1000 ms on the server
      // thus total resolve time should be:
      // 1000 + 1000 + 3000
      // but probably under 7 seconds
      expect(waited, 'waited ms').to.be.within(5000, 7200)
      expect(callCount, 'callCount').to.equal(1)
    })
})

it('works with options object', () => {
  cy.visit('/delayed')

  cy.waitForNetworkIdle(3000, { method: 'GET', pattern: '/user/delayed' })
    .should('have.keys', 'started', 'finished', 'waited', 'callCount')
    .then(({ waited, callCount }) => {
      // the page makes an Ajax call after 1500 ms
      // which is delayed by 1000 ms on the server
      // thus total resolve time should be:
      // 1000 + 1000 + 3000
      // but probably under 7 seconds
      expect(waited, 'waited ms').to.be.within(5000, 7200)
      expect(callCount, 'callCount').to.equal(1)
    })
})

it('fails when exceeding timeout', () => {
  const message = 'Network is busy'
  const failed = `Expected to fail with "${message}"`
  const passed = `${failed}, but it did not fail`

  cy.visit('/delayed')

  cy.on('fail', (err) => {
    if (err.message === passed) {
      throw err
    } else if (message) {
      expect(err.message).to.include(message, failed)
    }
    return false
  })

  cy.waitForNetworkIdle('GET', '/user/delayed', 3000, { timeout: 4000 })
  cy.then(() => {
    throw new Error(passed)
  });
})

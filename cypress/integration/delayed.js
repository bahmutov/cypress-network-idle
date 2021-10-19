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
      expect(waited, 'waited ms').to.be.within(5000, 7000)
      expect(callCount, 'callCount').to.equal(1)
    })
})

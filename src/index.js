/// <reference types="cypress" />

function waitForNetworkIdle(a1, a2, a3) {
  let method = 'GET'
  let pattern = '*'
  let timeLimitMs = 2000

  if (typeof a1 === 'number') {
    timeLimitMs = a1
  } else if (typeof a1 === 'string' && typeof a2 === 'number') {
    pattern = a1
    timeLimitMs = a2
  } else if (typeof a1 === 'string' && typeof a2 === 'string') {
    method = a1
    pattern = a2
    if (typeof a3 === 'number') {
      timeLimitMs = a3
    }
  } else {
    throw new Error('Invalid arguments')
  }

  let callCount = 0
  let lastNetworkAt
  cy.intercept(method, pattern, (req) => {
    callCount += 1
    lastNetworkAt = +new Date()
    // console.log('out req at ', lastNetworkAt)
    req.continue(() => {
      // count the response timestamp
      lastNetworkAt = +new Date()
      // console.log('response at', lastNetworkAt)
    })
  })

  const started = +new Date()
  let finished
  cy.log(`network idle for ${timeLimitMs} ms`)
  cy.wrap('waiting...', { timeout: timeLimitMs * 3 })
    .should(() => {
      const t = lastNetworkAt || started
      const elapsed = +new Date() - t
      if (elapsed < timeLimitMs) {
        // console.log('t =', t)
        // console.log('elapsed', elapsed)
        // console.log('timeLimitMs', timeLimitMs)
        throw new Error('Network is busy')
      }
      finished = +new Date()
    })
    .then(() => {
      const waited = finished - started
      cy.log(`finished after ${waited} ms`)
      cy.wrap({ started, finished, waited, callCount }, { log: false })
    })
}

Cypress.Commands.add('waitForNetworkIdle', waitForNetworkIdle)

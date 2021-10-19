/// <reference types="cypress" />

function waitForIdle(counters, timeLimitMs) {
  counters.started = +new Date()
  counters.finished
  cy.log(`network idle for ${timeLimitMs} ms`)
  cy.wrap('waiting...', { timeout: timeLimitMs * 3 })
    .should(() => {
      const t = counters.lastNetworkAt || counters.started
      const elapsed = +new Date() - t
      if (elapsed < timeLimitMs) {
        // console.log('t =', t)
        // console.log('elapsed', elapsed)
        // console.log('timeLimitMs', timeLimitMs)
        throw new Error('Network is busy')
      }
      counters.finished = +new Date()
    })
    .then(() => {
      const waited = counters.finished - counters.started
      cy.log(`finished after ${waited} ms`)
      cy.wrap(
        {
          started: counters.started,
          finished: counters.finished,
          waited,
          callCount: counters.callCount,
        },
        { log: false },
      )
    })
}

function waitForNetworkIdleImpl({ method, pattern, timeLimitMs }) {
  const counters = {
    callCount: 0,
    lastNetworkAt: null,
  }

  cy.intercept(method, pattern, (req) => {
    counters.callCount += 1
    counters.lastNetworkAt = +new Date()
    // console.log('out req at ', lastNetworkAt)
    req.continue(() => {
      // count the response timestamp
      counters.lastNetworkAt = +new Date()
      // console.log('response at', lastNetworkAt)
    })
  })

  waitForIdle(counters, timeLimitMs)
}

function parseArgs(a1, a2, a3) {
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

  return { method, pattern, timeLimitMs }
}

function waitForNetworkIdle(a1, a2, a3) {
  if (typeof a1 === 'string' && a1.startsWith('@') && typeof a2 === 'number') {
    const alias = a1.substr(1)

    const counters = Cypress.env(`networkIdleCounters_${alias}`)
    if (!counters) {
      throw new Error(`cypress-network-idle: "${alias}" not found`)
    }
    const timeLimitMs = a2
    return waitForIdle(counters, timeLimitMs)
  }

  const { method, pattern, timeLimitMs } = parseArgs(a1, a2, a3)

  waitForNetworkIdleImpl({ method, pattern, timeLimitMs })
}

function waitForNetworkIdlePrepare({ method, pattern, alias } = {}) {
  if (!alias) {
    throw new Error('cypress-network-idle: alias is required')
  }

  const counters = {
    callCount: 0,
    lastNetworkAt: null,
  }
  Cypress.env(`networkIdleCounters_${alias}`, counters)

  cy.intercept(method, pattern, (req) => {
    counters.callCount += 1
    counters.lastNetworkAt = +new Date()
    // console.log('out req at ', lastNetworkAt)
    req.continue(() => {
      // count the response timestamp
      counters.lastNetworkAt = +new Date()
      // console.log('response at', lastNetworkAt)
    })
  }).as(alias)
}

Cypress.Commands.add('waitForNetworkIdle', waitForNetworkIdle)
Cypress.Commands.add('waitForNetworkIdlePrepare', waitForNetworkIdlePrepare)

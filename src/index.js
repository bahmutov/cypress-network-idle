/// <reference types="cypress" />

function waitForIdle(counters, timeLimitMs, timeout, interval) {
  counters.started = +new Date()
  counters.finished = null

  cy.log(`network idle for ${timeLimitMs} ms (timeout: ${timeout} ms)`)
  cy.wrap('waiting...', { timeout }).should(check)

  function check() {
    const d = +new Date()
    const t = counters.lastNetworkAt || counters.started
    const waited = d - counters.started
    const elapsed = d - t

    if (elapsed > timeLimitMs && !counters.currentCallCount) {
      cy.log(`finished after ${waited} ms`)
      cy.wrap(
        {
          started: counters.started,
          finished: d,
          waited,
          callCount: counters.callCount,
        },
        { log: false },
      )
      return;
    }

    if (waited > timeout) {
      throw new Error(`Network is busy. Failed after ${waited} ms`)     
    }

    cy.wait(interval, { log: false }).then(check)
  }
}

function waitForNetworkIdleImpl({ method, pattern, timeLimitMs, timeout, interval }) {
  const counters = {
    callCount: 0,
    lastNetworkAt: null,
  }

  cy.intercept({ method: method, url: pattern }, (req) => {
    counters.callCount += 1
    counters.lastNetworkAt = +new Date()
    // console.log('req %s %s', req.method, req.url, counters.lastNetworkAt)

    // seems using event callbacks allows the other stubs to be called
    // https://github.com/bahmutov/cypress-network-idle/issues/8
    req.on('response', (res) => {
      counters.lastNetworkAt = +new Date()
      // console.log('res %s %s', req.method, req.url, counters.lastNetworkAt)
      // console.log(res.body)
    })
  })

  waitForIdle(counters, timeLimitMs, timeout, interval)
}

function parseArgs(a1, a2, a3, a4) {
  let method = 'GET'
  let pattern = '*'
  let timeLimitMs = 2000
  let timeout = Cypress.config('responseTimeout')
  let interval = 200

  if (typeof a1 === 'number') {
    timeLimitMs = a1
    timeout = Math.max(timeout, timeLimitMs * 3)
    if (typeof a2 === 'object') {
      timeout = a2.timeout || timeout
      interval = a2.interval || interval
    }
  } else if (typeof a1 === 'string' && typeof a2 === 'number') {
    pattern = a1
    timeLimitMs = a2
    timeout = Math.max(timeout, timeLimitMs * 3)
    if (typeof a3 === 'object' && a3.timeout) {
      timeout = a3.timeout || timeout
      interval = a3.interval || interval
    }
  } else if (typeof a1 === 'string' && typeof a2 === 'string') {
    method = a1
    pattern = a2
    if (typeof a3 === 'number') {
      timeLimitMs = a3
    }
    timeout = Math.max(timeout, timeLimitMs * 3)
    if (typeof a3 === 'object' && a3.timeout) {
      timeout = a3.timeout || timeout
      interval = a3.interval || interval
    }
    if (typeof a4 === 'object' && a4.timeout) {
      timeout = a4.timeout || timeout
      interval = a4.interval || interval
    }
  } else {
    throw new Error('Invalid arguments')
  }

  return { method, pattern, timeLimitMs, timeout, interval }
}

function waitForNetworkIdle(...args) {
  const { method, pattern, timeLimitMs, timeout, interval } = parseArgs(...args)

  if (typeof pattern === 'string' && pattern.startsWith('@')) {
    const alias = pattern.slice(1)

    const counters = Cypress.env(`networkIdleCounters_${alias}`)
    if (!counters) {
      throw new Error(`cypress-network-idle: "${alias}" not found`)
    }

    return waitForIdle(counters, timeLimitMs, timeout, interval)
  }

  waitForNetworkIdleImpl({ method, pattern, timeLimitMs, timeout, interval })
}

function waitForNetworkIdlePrepare({ method, pattern, alias } = {}) {
  if (!alias) {
    throw new Error('cypress-network-idle: alias is required')
  }
  if (!pattern) {
    throw new Error('cypress-network-idle: URL pattern is required')
  }

  const counters = {
    // all network calls started after we start waiting
    callCount: 0,
    // current number of pending calls
    currentCallCount: 0,
    lastNetworkAt: null,
  }
  Cypress.env(`networkIdleCounters_${alias}`, counters)

  cy.intercept({ method: method, url: pattern }, (req) => {
    counters.callCount += 1
    counters.currentCallCount += 1
    counters.lastNetworkAt = +new Date()

    // seems using event callbacks allows the other stubs to be called
    // https://github.com/bahmutov/cypress-network-idle/issues/8
    req.on('response', (res) => {
      counters.currentCallCount -= 1
      counters.lastNetworkAt = +new Date()
      // console.log('res %s %s', req.method, req.url, counters.lastNetworkAt)
      // console.log(res.body)
    })
  }).as(alias)
}

Cypress.Commands.add('waitForNetworkIdle', waitForNetworkIdle)
Cypress.Commands.add('waitForNetworkIdlePrepare', waitForNetworkIdlePrepare)

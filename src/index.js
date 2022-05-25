/// <reference types="cypress" />

const logPrefix = '**network-idle**'

function waitForIdle(counters, timeLimitMs, timeout, interval) {
  counters.started = +new Date()
  counters.finished = null

  const log = 'log' in counters ? counters.log : true
  if (log) {
    cy.log(`${logPrefix} for ${timeLimitMs} ms (timeout: ${timeout} ms)`)
  }
  cy.wrap(`${logPrefix} waiting...`, { timeout, log }).should(check)

  function check() {
    const d = +new Date()
    const t = counters.lastNetworkAt || counters.started
    const waited = d - counters.started
    const elapsed = d - t

    if (elapsed > timeLimitMs && !counters.currentCallCount) {
      if (log) {
        cy.log(`${logPrefix} finished after ${waited} ms`)
      }
      cy.wrap(
        {
          started: counters.started,
          finished: d,
          waited,
          callCount: counters.callCount,
        },
        { log: false },
      )
      return
    }

    if (waited > timeout) {
      throw new Error(`Network is busy. Failed after ${waited} ms`)
    }

    cy.wait(interval, { log: false }).then(check)
  }
}

function waitForNetworkIdleImpl({
  method,
  pattern,
  timeLimitMs,
  timeout,
  interval,
  log,
}) {
  if (typeof log === 'undefined') {
    log = true
  }
  const counters = {
    callCount: 0,
    lastNetworkAt: null,
    log,
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

function isCommandOptions(x) {
  return typeof x === 'object' && ('timeout' in x || 'log' in x)
}

function parseArgs(a1, a2, a3, a4) {
  let method = 'GET'
  let pattern = '*'
  let timeLimitMs = 2000
  let timeout = Cypress.config('responseTimeout')
  let interval = 200
  let log = true

  if (typeof a1 === 'number') {
    timeLimitMs = a1
    timeout = Math.max(timeout, timeLimitMs * 3)
    if (isCommandOptions(a2)) {
      timeout = a2.timeout || timeout
      interval = a2.interval || interval
      log = 'log' in a2 ? a2.log : log
    }
  } else if (typeof a1 === 'string' && typeof a2 === 'number') {
    pattern = a1
    timeLimitMs = a2
    timeout = Math.max(timeout, timeLimitMs * 3)
    if (isCommandOptions(a3)) {
      timeout = a3.timeout || timeout
      interval = a3.interval || interval
      log = 'log' in a3 ? a3.log : log
    }
  } else if (typeof a1 === 'string' && typeof a2 === 'string') {
    method = a1
    pattern = a2
    if (typeof a3 === 'number') {
      timeLimitMs = a3
    }
    timeout = Math.max(timeout, timeLimitMs * 3)
    if (isCommandOptions(a3)) {
      timeout = a3.timeout || timeout
      interval = a3.interval || interval
      log = 'log' in a3 ? a3.log : log
    }
    if (isCommandOptions(a4)) {
      timeout = a4.timeout || timeout
      interval = a4.interval || interval
      log = 'log' in a4 ? a4.log : log
    }
  } else {
    throw new Error('Invalid arguments')
  }

  return { method, pattern, timeLimitMs, timeout, interval, log }
}

function waitForNetworkIdle(...args) {
  const { method, pattern, timeLimitMs, timeout, interval, log } = parseArgs(
    ...args,
  )

  if (typeof pattern === 'string' && pattern.startsWith('@')) {
    const alias = pattern.slice(1)

    const counters = Cypress.env(`networkIdleCounters_${alias}`)
    if (!counters) {
      throw new Error(`cypress-network-idle: "${alias}" not found`)
    }

    return waitForIdle(counters, timeLimitMs, timeout, interval)
  }

  waitForNetworkIdleImpl({
    method,
    pattern,
    timeLimitMs,
    timeout,
    interval,
    log,
  })
}

function waitForNetworkIdlePrepare({ method, pattern, alias, log } = {}) {
  if (!alias) {
    throw new Error('cypress-network-idle: alias is required')
  }
  if (!pattern) {
    throw new Error('cypress-network-idle: URL pattern is required')
  }

  // by default, we want to log the network activity
  if (typeof log === 'undefined') {
    log = true
  }

  const counters = {
    // all network calls started after we start waiting
    callCount: 0,
    // current number of pending calls
    currentCallCount: 0,
    lastNetworkAt: null,
    log,
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

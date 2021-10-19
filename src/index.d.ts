// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Wait for the network to be idle for N milliseconds.
     * @param waitMs Milliseconds after the last network call
     */
    waitForNetworkIdle(waitMs: number): Chainable<WaitForNetworkIdleResult>

    /**
     * Wait for the network to be idle for N milliseconds.
     * @param pattern URL pattern to spy on
     * @param waitMs Milliseconds after the last network call
     */
    waitForNetworkIdle(
      pattern: string,
      waitMs: number,
    ): Chainable<WaitForNetworkIdleResult>

    /**
     * Wait for the network to be idle for N milliseconds.
     * @param method HTTP method to spy on
     * @param pattern URL pattern to spy on
     * @param waitMs Milliseconds after the last network call
     */
    waitForNetworkIdle(
      method: string,
      pattern: string,
      waitMs: number,
    ): Chainable<WaitForNetworkIdleResult>

    waitForNetworkIdlePrepare(
      options: WaitForNetworkIdleOptions,
    ): Chainable<WaitForNetworkIdleResult>
  }

  interface WaitForNetworkIdleOptions {
    method?: string
    pattern: string
    alias: string
  }

  interface WaitForNetworkIdleResult {
    started: number
    finished: number
    waited: number
    callCount: number
  }
}

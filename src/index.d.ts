// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Wait for the network to be idle for N milliseconds.
     * @param waitMs Milliseconds after the last network call
     */
    waitForNetworkIdle(waitMs: number, options?: Partial<WaitForNetworkIdleOptions>): Chainable<WaitForNetworkIdleResult>

    /**
     * Wait for the network to be idle for N milliseconds.
     * @param pattern URL pattern to spy on
     * @param waitMs Milliseconds after the last network call
     */
    waitForNetworkIdle(
      pattern: string,
      waitMs: number,
      options?: Partial<WaitForNetworkIdleOptions>,
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
      options?: Partial<WaitForNetworkIdleOptions>,
    ): Chainable<WaitForNetworkIdleResult>

    waitForNetworkIdlePrepare(
      options: WaitForNetworkIdleOptions,
    ): Chainable<WaitForNetworkIdleResult>
  }

  interface WaitForNetworkIdleOptions {
    method?: string
    pattern: string
    alias: string
    timeout: number
  }

  interface WaitForNetworkIdleResult {
    started: number
    finished: number
    waited: number
    callCount: number
  }
}

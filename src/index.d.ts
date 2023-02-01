// load type definitions that come with Cypress module
/// <reference types="cypress" />

// Ughh, cannot import network types from cypress
// since it seems to break the global interface merging
// so let's just type the basics of request and response

type ResourceType =
  | 'document'
  | 'fetch'
  | 'xhr'
  | 'websocket'
  | 'stylesheet'
  | 'script'
  | 'image'
  | 'font'
  | 'cspviolationreport'
  | 'ping'
  | 'manifest'
  | 'other'

interface BaseMessage {
  /**
   * The body of the HTTP message.
   * If a JSON Content-Type was used and the body was valid JSON, this will be an object.
   * If the body was binary content, this will be a buffer.
   */
  body: any
  /**
   * The headers of the HTTP message.
   */
  headers: { [key: string]: string | string[] }
}

type IncomingRequest = BaseMessage & {
  /**
   * Request HTTP method (GET, POST, ...).
   */
  method: string
  /**
   * Request URL.
   */
  url: string
  /**
   * URL query string as object.
   */
  query: Record<string, string | number>
  /**
   * The HTTP version used in the request. Read only.
   */
  httpVersion: string
  /**
   * The resource type that is being requested, according to the browser.
   */
  resourceType: ResourceType
  /**
   * If provided, the number of milliseconds before an upstream response to this request
   * will time out and cause an error. By default, `responseTimeout` from config is used.
   */
  responseTimeout?: number
  /**
   * Set if redirects should be followed when this request is made. By default, requests will
   * not follow redirects before yielding the response (the 3xx redirect is yielded)
   */
  followRedirect?: boolean
  /**
   * If set, `cy.wait` can be used to await the request/response cycle to complete for this
   * request via `cy.wait('@alias')`.
   */
  alias?: string
}

type IncomingResponse = BaseMessage & {
  /**
   * The HTTP status code of the response.
   */
  statusCode: number
  /**
   * The HTTP status message.
   */
  statusMessage: string
  /**
   * Kilobytes per second to send 'body'.
   */
  throttleKbps?: number
  /**
   * Milliseconds to delay before the response is sent.
   */
  delay?: number
}

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Wait for the network to be idle for N milliseconds.
     * @param waitMs Milliseconds after the last network call
     */
    waitForNetworkIdle(
      waitMs: number,
      options?: Partial<WaitForNetworkIdleOptions>,
    ): Chainable<WaitForNetworkIdleResult>

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

    /**
     * Starts spying on the matching network calls
     * @see https://github.com/bahmutov/cypress-network-idle#readme
     */
    waitForNetworkIdlePrepare(
      options: WaitForNetworkIdlePrepareOptions,
    ): Chainable<WaitForNetworkIdleResult>
  }

  interface WaitForNetworkIdleOptions {
    method?: string
    pattern: string
    alias: string
    timeout: number
    interval: number
    log?: boolean
  }

  interface WaitForNetworkIdleResult {
    started: number
    finished: number
    waited: number
    callCount: number
  }

  interface WaitForNetworkIdlePrepareOptions {
    method?: string
    pattern: string
    alias: string
    log?: boolean
    /**
     * Fail the test if any of the matching network calls
     * returns 4xx status code
     */
    failOn4xx?: boolean
    /**
     * Fail the test if any of the matching network calls
     * returns 5xx status code
     */
    failOn5xx?: boolean
    /**
     * Fail the test if this callback returns an error string.
     */
    failOn?: (req: IncomingRequest, res: IncomingResponse) => string | undefined
  }
}

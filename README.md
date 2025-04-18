# cypress-network-idle ![cypress version](https://img.shields.io/badge/cypress-14.3.0-brightgreen) [![renovate-app badge][renovate-badge]][renovate-app] [![ci](https://github.com/bahmutov/cypress-network-idle/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/bahmutov/cypress-network-idle/actions/workflows/ci.yml)

> A little Cypress.io plugin for waiting for network to be idle before continuing with the test

## Videos

- [Cypress-network-idle plugin](https://youtu.be/adHjTf5j6uE)
- [Prepare Intercept And Wait Using cypress-network-idle Plugin](https://youtu.be/E6P_rBt6caU)

## Study

Covered in my course 🎓 [Cypress Network Testing](https://cypress.tips/courses/network-testing)

## Install

```
# install using NPM
npm i -D cypress-network-idle
# install using Yarn
yarn add -D cypress-network-idle
```

Import or require this plugin from the support file or from the spec file

```js
import 'cypress-network-idle'
```

## Use

Wait for two seconds to pass without any network calls (Ajax, static resources)

```js
cy.waitForNetworkIdle(2000)
```

Wait one second without any `GET` calls to `/v1/api` endpoint

```js
cy.waitForNetworkIdle('/v1/api', 1000)
```

Wait for 5 seconds without any `POST` calls to `/graphql` endpoint

```js
cy.waitForNetworkIdle('POST', '/graphql', 5000)
```

Wait for 5 seconds for any call (`GET`, `POST`, `PUT`, etc) to any endpoint

```js
cy.waitForNetworkIdle('*', '*', 5000)
```

Wait for 5 seconds for any `POST` or `GET` to any endpoint

```js
cy.waitForNetworkIdle('+(POST|GET)', '*', 5000)
```

For pattern matching see more examples in the [`cy.intercept()` documentation](https://docs.cypress.io/api/commands/intercept#Pattern-Matching).

## Timeouts

Let's take this example

```js
cy.waitForNetworkIdle('POST', '/graphql', 5000)
```

The `5000` argument is the wait number in milliseconds. The command will check for 5 seconds with _no_ `POST /graphql` calls. But how long do we need to wait for those idle 5 seconds? By default, it is the maximum of `Cypress.config('responseTimeout')` value (usually 30 seconds in Cypress) and the three times the wait amount (in our case 15 seconds).

You can set a longer time limit for waiting for network to be idle for 5 seconds. Let's wait for up to a minute for 5 second idle period:

```js
cy.waitForNetworkIdle('POST', '/graphql', 5000, { timeout: 60_000 })
```

## No logging

You can disable the log messages by adding option object with `{ log: false }` property

```js
cy.waitForNetworkIdle('/v1/api', 1000, { log: false })
```

## Separate prepare

Sometimes the network calls start early. For example, if the network calls are kicked off by the `cy.visit` you want to start capturing the timestamps before it, but wait for the network to be idle after. You can start listening using the `prepare` call like this.

```js
cy.waitForNetworkIdlePrepare({
  method: 'GET',
  pattern: '*',
  alias: 'calls',
})
cy.visit('/')
// now wait for the "@calls" to finish
cy.waitForNetworkIdle('@calls', 1000)
```

Notice the use of the alias parameter to correctly listen to the intercepted calls. You can disable logging by adding `log: false` to the prepare call

```js
cy.waitForNetworkIdlePrepare({
  method: 'GET',
  pattern: '*',
  alias: 'calls',
  log: false,
})
```

You can wait multiple times for the prepared network alias.

```js
cy.waitForNetworkIdlePrepare({
  method: 'POST',
  pattern: '/api/graphql',
  alias: 'graphql',
})
cy.visit('/')
cy.waitForNetworkIdle('@graphql', 1000)
// the page has fully loaded
// interact with the page
cy.waitForNetworkIdle('@graphql', 1000)
// the page has finished additional processing
```

### fail on error status code

By default, the network calls might fail and the test happily continues. You can make the idle spy fail if any of the matching network calls return 4xx or 5xx errors. These classes of error status code have their own flag to enable.

### fail on 4xx

```js
// fail the test if any of the matching calls
// returns a 4xx status code
cy.waitForNetworkIdlePrepare({
  method: '*',
  alias: 'all',
  pattern: '**',
  failOn4xx: true,
})
```

![The test fails when one of the calls receives 401 from the server](./images/4xx.png)

### fail on 5xx

```js
// fail the test if any of the matching calls
// returns a 5xx status code
cy.waitForNetworkIdlePrepare({
  method: '*',
  alias: 'all',
  pattern: '**',
  failOn5xx: true,
})
```

![The test fails when one of the calls receives 500 from the server](./images/5xx.png)

### failOn

You can write your own callback function `failOn(req, res)` to decide if the network call should fail the test. Can be useful to include additional information in the error message. For example, let's include the custom message headers:

```js
cy.waitForNetworkIdlePrepare({
  method: 'POST',
  alias: 'post',
  pattern: '/status-401',
  failOn(req, res) {
    if (res.statusCode === 401) {
      return `Call ${req.method} ${req.url} (x flag ${req.headers['x-my-flag']}) failed`
    }
  },
})
```

All you need to do to fail the test is return an error message from the synchronous callback.

## Multiple registrations

If you try to register the same intercept method, pattern, and alias multiple times, only a single first registration will be made.

```js
cy.waitForNetworkIdlePrepare({
  method: 'GET',
  pattern: '/user',
  alias: 'user',
})
// this registration will be ignored
cy.waitForNetworkIdlePrepare({
  method: 'GET',
  pattern: '/user',
  alias: 'user',
})
// this registration will be ignored
cy.waitForNetworkIdlePrepare({
  method: 'GET',
  pattern: '/user',
  alias: 'user',
})
```

## Pending calls

If there are ongoing network calls, this plugin waits for them to resolve before checking for network idle, see the [after.js](./cypress/e2e/after.js) spec.

## Yields

The command yields an object with a few timestamps and the number of network calls. See the [src/index.d.ts](./src/index.d.ts) for precise fields

```js
cy.waitForNetworkIdle(2000)
  // check how long the command waited
  .its('waited')
  // it should have waited for at least 2 seconds
  // but could be up to 3 seconds if the app
  // made a call one second after the start
  .should('be.within', 2000, 3000)
```

## Limit the intercept

You can limit which requests to consider by using `method` and `pattern` parameters. For example, see the spec [get-vs-post.js](./cypress/e2e/get-vs-post.js)

```js
// listen to all POST calls
cy.waitForNetworkIdlePrepare({
  method: 'POST',
  pattern: '*',
  alias: 'postCalls',
})

cy.visit('/get-vs-post')
cy.waitForNetworkIdle('@postCalls', 2000)
```

```js
// listen to "POST /add-user" calls
cy.waitForNetworkIdlePrepare({
  method: 'POST',
  pattern: '/add-user',
  alias: 'addUser',
})

cy.visit('/get-vs-post')
cy.waitForNetworkIdle('@addUser', 2000)
```

## Overwrite commands

If you always want to want for network idle when calling `cy.visit` you can overwrite this command using the provided code in [src/register.js](./src/register.js) file

```js
// your spec
const { registerVisit } = require('cypress-network-idle/src/register')
registerVisit({ timeout: 1000 })

it('waits for network idle', () => {
  cy.visit('/')
  // the network has been idle for 1 second
})
```

## Error message

If waiting for all network calls to finish and for network to be idle for N milliseconds fails, the plugin prints all outstanding (current) network calls

![Outstanding network calls](./images/outstanding-calls.png)

## Types

This plugin includes the TypeScript types, import them from your JavaScript files using the reference types comment or via TS config.

```js
/// <reference types="cypress-network-idle" />
```

## Discussion

This plugin uses the timestamp of the request and the response to compute the idle timestamp. This helps with any longer-running requests - the idle time is computed from their completion.

## Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2021

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog)
- [videos](https://www.youtube.com/glebbahmutov)
- [presentations](https://slides.com/bahmutov)
- [cypress.tips](https://cypress.tips)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/cypress-network-idle/issues) on Github

## MIT License

Copyright (c) 2021 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/

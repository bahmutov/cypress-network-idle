# cypress-network-idle ![cypress version](https://img.shields.io/badge/cypress-9.5.3-brightgreen) [![renovate-app badge][renovate-badge]][renovate-app] [![ci](https://github.com/bahmutov/cypress-network-idle/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/bahmutov/cypress-network-idle/actions/workflows/ci.yml)
> A little Cypress.io plugin for waiting for network to be idle before continuing with the test

## Videos

- [Cypress-network-idle plugin](https://youtu.be/adHjTf5j6uE)
- [Prepare Intercept And Wait Using cypress-network-idle Plugin](https://youtu.be/E6P_rBt6caU)

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

Wait one second without any calls to `/v1/api` endpoint

```js
cy.waitForNetworkIdle('/v1/api', 1000)
```

Wait for 5 seconds without any `POST` calls to `/graphql` endpoint

```js
cy.waitForNetworkIdle('POST', '/graphql', 5000)
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

Notice the use of the alias parameter to correctly listen to the intercepted calls.

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

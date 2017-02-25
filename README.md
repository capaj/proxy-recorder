# proxy-recorder
proxy with recording capabilities for easy mocking of 3rd party APIs.

## install
```
npm i proxy-recorder --save-dev
```
Default directory where jsons of responses are stored is relative directory test/fixtures/

##API
exposes just two methods so far:
```javascript
const proxyR = require('proxy-recorder')
const opts = {port: 8100, target: 'https://api.github.com'}

proxyR.rec(opts);	//fires up a proxy to github which records any response going trough
//and then for testing
proxyR.mock(opts)	// recorded message is retrieved from filesystem based on url and body of the message and mocked server sends the fixture back
```

##Other projects
### [connect-prism](https://github.com/seglo/connect-prism)
I tried using this project for mocking github api and it was not possible, so I discarded this project as a viable solution for me.
Otherwise it has the same goals and much bigger history, so it might be worth looking at.
###How does this differ from [node-replay](https://github.com/assaf/node-replay)?
Node replay can store mocks inside node, but doesn't help you when you need an API mock as separate node instance 
running side by side your single page app.
Proxy recorder was made out of a need specificaly to mock Github API for E2E tests of frontend app.

# proxy-recorder
proxy with recording capabilities for easy mocking of 3rd party APIs.

##How does this differ from [node-replay](https://github.com/assaf/node-replay)?
Node replay can store mocks inside node, but doesn't help you when you need an API mock as separate node instance 
running side by side your single page app. 

Proxy recorder was made out of a need specificaly to mock Github API for E2E tests of frontend app.

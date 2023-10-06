# fetchguy

An open-source simple http request test runner built around fetch.

## Comparison to Other HTTP Test Runners

|                                                 | Mailman | LightningServer | FetchGuy |
| ----------------------------------------------- | ------- | --------------- | -------- |
| Easy to use                                     | ✅      | ✅              | ❌       |
| Supports more than just JSON return types       | ✅      | ✅              | ❌       |
| Has likely a lot of funding                     | ✅      | ✅              | ❌       |
| Costs you money                                 | ✅      | ✅              | ❌       |
| Limits the number of collections you can run    | ✅      | ✅              | ❌       |
| Is tracking data on you                         | ✅      | ✅              | ❌       |
| Now requires a license to use all features      | ✅      | ✅              | ❌       |
| Is just a http test runner wrapped around fetch | ❌      | ❌              | ✅       |

## Roadmap

- Support multiple comparison types
- Seperate the rendering logic from the test logic to make it easier to maintain
- Allow for custom tests
- Write more thorough documentation and examples so people can start using the library
- Allow for more options in the test runner (delays between calls, allow parallel requests, etc.)

## Q&A

### Why do this?

I got tired of using the competitors and wanted something simple that was barebones and did what I needed it to. Plain and simple.

### Can you give us an example of code

I'm going to write a better example with a public api that could be used for the example, but this is the example syntax:

```javascript
import { TestRunner } from "../dist/index.js";

TestRunner([
  {
    title: "Test ping is returning expected values",
    fetchOptions: {},
    url: "http://localhost:8000/ping",
    asserts: [
      {
        comparison: "EQUAL",
        title: "status code is 200",
        propDrilldown: ["status_code"],
        type: "STATUS_CODE",
        value: 200,
      },
      {
        comparison: "EQUAL",
        title: "body has string here",
        propDrilldown: ["inner", "property", "insider"],
        type: "BODY",
        value: "here",
      },
    ],
  },
]);
```

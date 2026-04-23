---
paths:
  - "src/**/{spec,test}.{ts,tsx}"
---

In unit tests for server routers, never use `toHaveBeenCalledWith` on database mock functions (`mockDb.*`) as the primary assertion. Always assert on the output/result returned by the route handler first.

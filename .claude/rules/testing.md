---
paths:
  - "src/**/{spec,test}.{ts,tsx}"
---

In unit tests for server routers, never use `toHaveBeenCalledWith` on Prisma mock functions (`mockDb.*`). Always assert on the output/result returned by the route handler instead.

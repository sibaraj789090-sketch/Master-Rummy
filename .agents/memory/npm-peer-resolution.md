---
name: npm peer resolution in Replit
description: Workaround for npm 10 crashing while resolving Vite 8's optional devtools peer tree.
---

When installing the imported Vite 8 dependencies with Node 20/npm 10.8.2, npm's Arborist crashed with `Cannot read properties of null (reading 'edgesOut')` while resolving the optional `@vitejs/devtools` and Vitest peer graph. Installing with `legacy-peer-deps=true` succeeded.

**Why:** This was an npm resolver failure in the optional peer graph, not an application compile error or a package firewall rejection.

**How to apply:** If the same install stack reappears in this environment, use the `legacy-peer-deps` npm setting for installation. Keep that setting only while needed, and avoid retaining lockfiles that point at Replit's internal package registry.

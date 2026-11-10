# System Design Labs

Eleven small, hands-on projects for learning how distributed systems behave by building them, breaking them, and measuring what happens. Three of them are AI/LLM systems.

It's easy to know that you should put a cache in front of a database. It's more useful to have watched a burst of misses on one hot key take the database down, measured it, and fixed it. Each project builds one component, pushes it until it fails, and records the numbers.

## How each project works: build → break → write

| Session          | What happens                                                              | Output                         |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------ |
| **1. Build**     | Happy path with the one new technology, plus integration tests            | Working service, green tests   |
| **2. Break**     | Load-test with k6, kill containers, inject latency and failures           | A "what broke" log with numbers |
| **3. Write + fix** | Fix the worst failure, then write a one-page design doc                 | `docs/NN-<project>.md`         |

Session 2 is the point. When time runs short, features get cut, never the breaking.

## Projects

| #   | Project                  | Builds on  | New technology                                                         | Status      |
| --- | ------------------------ | ---------- | ---------------------------------------------------------------------- | ----------- |
| 1   | URL shortener            | —          | Postgres, Redis cache, Prometheus + Grafana, k6, Docker Compose, Testcontainers | Not started |
| 2   | Distributed rate limiter | 1          | Redis Lua scripts, nginx load balancing, horizontal scaling            | Not started |
| 3   | Background job pipeline  | 1          | BullMQ, S3 API, OpenTelemetry tracing, idempotency                     | Not started |
| 4   | Auth service             | 1, 2       | argon2, sessions, JWT, OAuth 2 / OIDC with Keycloak                    | Not started |
| 5   | RAG over documentation   | 1          | Embeddings, pgvector, hybrid search, reranking, evals                  | Not started |
| 6   | LLM gateway              | 2, 3, 4, 5 | LLM streaming, prompt and semantic caching, fallbacks, cost tracking   | Not started |
| 7   | Real-time chat           | 1, 2, 4    | WebSockets, Redis pub/sub, presence                                    | Not started |
| 8   | Event-driven orders      | 1          | Kafka, transactional outbox, idempotent consumers                      | Not started |
| 9   | Search                   | 8          | Elasticsearch, index sync from events, typeahead                       | Not started |
| 10  | Database scaling lab     | 1          | Replication, PgBouncer, partitioning, consistent hashing               | Not started |
| 11  | AI agent                 | 4, 5, 6, 8 | Tool-use loop, MCP, durable execution, guardrails, agent evals         | Not started |

Projects are ordered so each one depends only on things an earlier project taught. Project 11 is the capstone and pulls together auth, RAG, the LLM gateway and the orders database.

## Stack

| Concern         | Choice                                                     |
| --------------- | ---------------------------------------------------------- |
| Language        | Node 24 LTS + TypeScript (strict)                          |
| HTTP            | Express 5                                                  |
| Validation      | Zod at every boundary                                      |
| Database        | PostgreSQL 17+ with Drizzle ORM                            |
| Cache / KV      | Redis 8 via `ioredis`                                      |
| Observability   | pino logs, Prometheus + Grafana metrics, OpenTelemetry → Tempo traces |
| Local infra     | Docker Compose                                             |
| Testing         | Vitest + Testcontainers (real dependencies, not mocks), k6 for load |
| CI              | GitHub Actions: lint, typecheck, tests on every push       |
| LLM (5, 6, 11)  | Anthropic TypeScript SDK, Voyage AI embeddings             |

## Repository layout

```
system-design-labs/
  package.json                # pnpm workspace
  infra/
    compose.data.yml          # postgres, redis (shared by most projects)
    compose.observability.yml # prometheus, grafana, tempo
    grafana/dashboards/
    k6/                       # load test scripts, one per project
  packages/
    platform/                 # shared config, logger, metrics, tracing, error middleware
  projects/
    01-url-shortener/
    ...
    11-agent/
  docs/
    01-url-shortener.md       # one design doc per project
    ...
```

`packages/platform` grows as the projects do: metrics in #1, tracing in #3, auth middleware in #4.

## Design docs

Each project ends with a one-page doc in `docs/` covering:

1. **What it does**: two sentences and a box diagram.
2. **Key decisions**: "chose X over Y because Z".
3. **What broke**: each failure caused, what happened, and the numbers.
4. **What I fixed**, with measured before/after.
5. **At 100× scale**: what changes first, and why.
6. **Open questions**: what I'd do differently, and what I'd want to learn next.

## Questions each project answers

| Question                                                        | Project(s) |
| --------------------------------------------------------------- | ---------- |
| What actually happens to p99 latency when the cache goes cold?  | 1          |
| How do you share state across horizontally scaled servers?      | 2          |
| If delivery is at-least-once, how do you avoid doing work twice? | 3, 8       |
| JWTs or sessions, and how do you revoke a token?                | 4          |
| How do you know a RAG system is retrieving the right thing?     | 5          |
| What happens when the model provider is down or overloaded?     | 6          |
| How does a message reach a user connected to a different server? | 7          |
| How do you write to a database and publish an event reliably?   | 8          |
| How do you keep a search index in sync with its source of truth? | 9          |
| What consistency does a read replica give you?                  | 10         |
| How do you stop an agent from taking actions it shouldn't?      | 11         |

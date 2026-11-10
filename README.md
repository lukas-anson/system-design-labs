# System Design Labs

Eleven small, hands-on projects that turn system design vocabulary into implementation experience, including three AI/LLM systems.

"Put a cache in front of it" is vocabulary. "When I load-tested my cache, a burst of misses on one hot key took Postgres from 4 ms to 900 ms p99, so I added request coalescing" is experience. Every project here is built to produce at least one sentence like that.

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
6. **Interview answers**: the questions this project prepares for.

## Interview question index

| Question                                         | Project(s) |
| ------------------------------------------------ | ---------- |
| Design a URL shortener                           | 1, 10      |
| Design a rate limiter                            | 2          |
| Design Dropbox / file upload                     | 3          |
| Design a notification system                     | 3, 8       |
| Design login / SSO                               | 4          |
| Design WhatsApp / Slack                          | 7, 4       |
| Design an e-commerce order system                | 8, 10      |
| Design typeahead / product search                | 9, 5       |
| Scale the database                               | 10         |
| Design a support bot over docs / enterprise RAG  | 5          |
| Design ChatGPT / serve LLM features at scale     | 6, 7       |
| Design an AI agent                               | 11         |

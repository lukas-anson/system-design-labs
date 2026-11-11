# System Design Labs

Eleven small, hands-on labs for learning how distributed systems behave by building them. Three of them are AI/LLM systems.

It's easy to know that you should put a cache in front of a database. It's more useful to have built the version without one, watched the database become the bottleneck, and then added the cache and seen what changed. Each lab grows one system from its simplest version, one layer at a time.

## How each lab works: a ladder of stages

- **Stage 0 is the simplest thing that works**: usually one file, in-memory data, no Docker.
- **Each next stage adds one new tool or concept**, because of a problem the previous stage ran into. Postgres arrives because a restart lost the data; a cache arrives because the database became the bottleneck.
- **Stopping at any stage still leaves something working.** Later stages go deeper; they aren't mandatory.
- **Each lab ends with a short write-up** in its `NOTES.md`.

Labs are independent: none depends on another, and they can be done in any order. Where a lab needs a piece another lab covers in depth (auth, rate limiting, retrieval), it includes a small, simple version of that piece.

## Labs

| #   | Lab                      | Main ideas                                                       | Status      |
| --- | ------------------------ | ---------------------------------------------------------------- | ----------- |
| 1   | URL shortener            | Postgres, indexes, load testing, Redis cache                     | Not started |
| 2   | Rate limiter             | Shared state across instances, Redis atomicity, Lua              | Not started |
| 3   | Background jobs          | Queues, workers, retries, idempotency, object storage            | Not started |
| 4   | Auth                     | Password hashing, sessions, JWTs, refresh tokens, OAuth/OIDC     | Not started |
| 5   | RAG over documentation   | Embeddings, vector search, hybrid search, evals                  | Not started |
| 6   | LLM gateway              | Streaming proxy, usage and cost, caching, fallbacks              | Not started |
| 7   | Real-time chat           | WebSockets, pub/sub fan-out, ordering, presence                  | Not started |
| 8   | Event-driven orders      | Kafka, dual writes, transactional outbox, idempotent consumers   | Not started |
| 9   | Search                   | Full-text search, Elasticsearch, index sync, typeahead           | Not started |
| 10  | Database scaling         | Partitioning, connection pooling, replication, consistent hashing | Not started |
| 11  | AI agent                 | Tool-use loop, guardrails, approvals, checkpoints, evals, MCP    | Not started |

The numbering is a suggested order, easiest first, not a dependency chain.

### What each lab is

**1. URL shortener.** A service that turns a long web address into a short one (like bit.ly) and redirects anyone who opens the short link. Almost all of its traffic is reads, which makes it a good place to learn databases, indexes and caching.

**2. Rate limiter.** A rate limiter caps how often someone can call an API, say 100 requests a minute, so one user can't overwhelm it. Once the API runs on several servers, they all have to agree on the count: if each server counts separately, a user gets three times the limit. This lab builds one that keeps a single, accurate count shared by every server.

**3. Background jobs.** Some work is too slow to do while the user waits, like resizing an uploaded photo. Instead, the server puts a job on a queue and replies right away, and separate worker processes do the work later. This lab builds that for image thumbnails and makes sure crashes and retries never lose a job or do it twice.

**4. Auth.** Handles signing up, logging in, and proving who you are on every request. It covers storing passwords safely, the two common ways of keeping someone logged in (server-side sessions and tokens), and "Log in with GitHub"-style sign-in.

**5. RAG over documentation.** A chatbot that answers questions about a set of docs. It first searches the docs for relevant passages, then asks an LLM to answer using only those passages and to cite them; that's what RAG (retrieval-augmented generation) means. The lab measures how often the search finds the right passages, because that's where most wrong answers start.

**6. LLM gateway.** A single service that sits between your apps and the AI model provider, so every AI request goes through one place. It handles what each app would otherwise build itself: checking API keys, per-user spending limits, caching repeated answers, tracking cost, and switching to a backup model when the main one is down.

**7. Real-time chat.** A chat app where messages appear instantly, like Slack. Each user keeps an open connection to one of several servers, so the hard part is getting a message from a user on one server to a user on another, in order, without losing any when a server restarts. It also shows who's online.

**8. Event-driven orders.** An order system where placing an order announces an "order placed" event, and other services react to it on their own: one sends a confirmation email, another updates sales totals. The services never call each other directly; they communicate through Kafka, a durable log of events. The tricky part is making sure no event is lost or handled twice, even when something crashes halfway through.

**9. Search.** Product search with a search bar, filters, suggestions as you type, and results ranked by relevance. Products are stored in Postgres, and a copy is kept in Elasticsearch, a dedicated search engine. The lab covers keeping that copy in sync and changing how products are indexed without any downtime.

**10. Database scaling.** Experiments with what to do when one database server isn't enough: splitting a huge table into smaller pieces, sharing a limited number of connections, copying data to read-only replicas, and spreading data across several servers. Each technique removes one bottleneck and introduces a new problem, such as a replica that's a few seconds behind.

**11. AI agent.** An AI assistant that takes actions, not just answers questions: it looks up orders, checks the shop's policies and opens support tickets, deciding step by step what to do next. The focus is on making it safe and reliable: it can only read data it's allowed to, a person approves anything with side effects, and a run that crashes picks up where it left off.

## Stack

Every lab uses **Node 26 + TypeScript (strict)**, run directly with Node's type stripping (no build step), and **Express 5**. Everything else is introduced at the stage that needs it, not installed up front: Docker Compose, Postgres, Redis, k6, nginx, BullMQ, Kafka, Elasticsearch, the Anthropic SDK and so on.

## Repository layout

```
system-design-labs/
  pnpm-workspace.yaml         # one install for all labs; no lab imports another
  projects/
    01-url-shortener/
      package.json
      tsconfig.json
      compose.yml             # added at the first stage that needs Docker
      src/
      NOTES.md                # the write-up
    02-rate-limiter/
    ...
```

## Write-ups

Each lab ends with a half-page to one-page `NOTES.md`:

1. **What it does**: two sentences and a box diagram of the final stage.
2. **The ladder**: one line per stage: what was added and the problem that made it necessary.
3. **Key decisions**: "chose X over Y because Z".
4. **Problems I hit**: what broke or surprised me, what fixed it, with numbers where I have them.
5. **At 100× scale**: what changes first, and why.
6. **Interview answers**: the 2–3 questions this lab prepares me for.

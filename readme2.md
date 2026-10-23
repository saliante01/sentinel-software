# Sentinel

**Open-source application monitoring and anomaly detection, built with Java and Spring Boot.**

> **Project status:** Planning — v0.1 is not implemented yet.

Sentinel is an evolving observability project designed to monitor web applications and APIs, record availability and response times, and eventually detect unusual behavior and help developers investigate incidents.

The long-term goal is to make Sentinel useful alongside applications built with different languages and frameworks. Sentinel itself is written in Java, but monitored services will not need to be Java applications.

## Why Sentinel?

Traditional monitoring can tell you that an application is slow or unavailable. Sentinel aims to build on those observations by identifying unexpected patterns, correlating evidence, and eventually generating understandable diagnostic suggestions.

This project is also a progressive learning journey in Spring Boot and backend engineering. Features will be implemented in small, testable increments rather than introducing advanced infrastructure before it is needed.

## Scope: v0.1

The first release will be a **basic availability and latency monitor for HTTP services**. A user will register an HTTP/HTTPS endpoint, and Sentinel will check it periodically and retain the results.

**Not in v0.1:** AI analysis, log collection, distributed tracing, network packet inspection, authentication, and a graphical dashboard.

### Functional requirements

| ID | Requirement | Description |
| --- | --- | --- |
| RF-01 | Register application | Register a monitored application with a name and HTTP/HTTPS URL. |
| RF-02 | List applications | Retrieve all registered applications. |
| RF-03 | Get application | Retrieve one application by its identifier. |
| RF-04 | Delete application | Remove an application and stop monitoring it. |
| RF-05 | Check availability | Make an HTTP GET request and determine whether the endpoint responds successfully. |
| RF-06 | Measure latency | Measure the duration of each check in milliseconds. |
| RF-07 | Automatic checks | Run monitoring checks on a configurable schedule. |
| RF-08 | Persist results | Save the timestamp, response time, HTTP status (when available), availability, and error details. |
| RF-09 | View history | Retrieve recent checks for a monitored application in reverse chronological order. |

### Non-functional requirements

| ID | Requirement |
| --- | --- |
| RNF-01 | Backend implemented in Java and Spring Boot. |
| RNF-02 | HTTP API exchanging JSON data. |
| RNF-03 | Clear separation of controllers, services, and persistence concerns. |
| RNF-04 | Validate incoming input, especially monitored URLs. |
| RNF-05 | Configure connection and request timeouts. |
| RNF-06 | Failure of a monitored application must not stop checks for other applications. |
| RNF-07 | Use PostgreSQL for persistent storage once persistence is introduced. |
| RNF-08 | Add automated tests for core behavior. |
| RNF-09 | Document setup, execution, and API usage. |
| RNF-10 | In the initial release, restrict monitoring to explicitly authorized destinations; prevent arbitrary access to private or sensitive network targets. |

## Planned data model

### `MonitoredApplication`

| Field | Purpose |
| --- | --- |
| `id` | Unique identifier |
| `name` | Display name |
| `url` | HTTP/HTTPS endpoint to monitor |
| `createdAt` | Registration timestamp |
| `active` | Whether checks are enabled |

### `HealthCheck`

| Field | Purpose |
| --- | --- |
| `id` | Unique identifier |
| `applicationId` | Reference to `MonitoredApplication` |
| `checkedAt` | Timestamp of the check |
| `responseTimeMs` | Measured response time |
| `httpStatus` | HTTP status when a response was received; otherwise null |
| `available` | Whether the endpoint met the availability rule |
| `errorMessage` | Failure details when applicable |

**Relationship:** one monitored application can have many health checks.

For v0.1, an endpoint is considered available when the HTTP check completes and returns a **2xx status**. Redirects and other status codes are not considered successful under this initial rule. The precise timeout and redirect policy will be defined during implementation.

## Planned architecture

```text
           Monitored application / HTTP endpoint
                            |
                            | HTTP GET checks
                            v
+-------------------------------------------------------+
|                  Sentinel (Spring Boot)               |
|                                                       |
| REST API -> Application Service -> Persistence Layer   |
|                   |                                   |
|              Check Scheduler                          |
|                   |                                   |
|              HTTP Check Client                        |
|                   |                                   |
|              Health Check Service                     |
+-------------------|-----------------------------------+
                    |
                    v
                PostgreSQL
```

Sentinel will start as a **modular monolith**. Collection and analysis concerns may later become independent components if that complexity is justified.

## Technology stack

| Technology | Purpose | Phase |
| --- | --- | --- |
| Java 21 | Programming language | Initial setup |
| Spring Boot | Application framework and REST API | Initial setup |
| Maven Wrapper | Reproducible builds | Initial setup |
| Spring Web MVC | HTTP endpoints | Initial setup |
| Spring Validation | Input validation | v0.1 |
| Spring Data JPA | Database access | v0.1 |
| PostgreSQL | Persistent data storage | v0.1 |
| JUnit | Automated tests | v0.1 |
| Docker | Reproducible local deployment | Later |
| OpenTelemetry | Metrics, logs, and traces | Later |
| Spring AI | AI-assisted diagnostics | Later |

The final dependency versions will be chosen when each feature is implemented.

## Development roadmap

- [ ] **Stage 0 — Bootstrap:** Generate the Spring Boot project and run a basic JSON endpoint.
- [ ] **Stage 1 — REST basics:** Understand controllers and build a simple API.
- [ ] **Stage 2 — In-memory registration:** Add validation, DTOs, and application services.
- [ ] **Stage 3 — Application management:** Implement list, lookup, and deletion.
- [ ] **Stage 4 — Manual health checks:** Make HTTP requests, handle failures, and measure latency.
- [ ] **Stage 5 — Persistence:** Add PostgreSQL, entities, repositories, and migrations.
- [ ] **Stage 6 — Scheduling:** Perform checks automatically.
- [ ] **Stage 7 — History:** Retrieve stored checks per application.
- [ ] **Stage 8 — Quality:** Add automated tests, API documentation, and development instructions.

### Beyond v0.1

- **v0.2 — Anomaly detection:** Detect unusual latency, error rates, or availability patterns using explainable statistical rules.
- **Future — Container and application telemetry:** Collect authorized logs, metrics, and traces through configurable integrations and established standards.
- **Future — Intelligent diagnostics:** Correlate evidence and use AI to suggest potential causes while distinguishing facts from hypotheses.
- **Future — Dashboard and alerts:** Visualize service health and surface actionable incidents.

## Getting started

The repository is in its planning phase. **There are no runnable installation steps yet.** Setup commands and configuration examples will be added after Stage 0 is complete.

Expected development tools:

- JDK 21
- IntelliJ IDEA Community or Visual Studio Code
- Git
- Maven Wrapper (included when the project is generated)

## Design principles

1. **Learn incrementally:** Implement and test one concept at a time.
2. **Prefer simplicity:** Begin with a modular monolith, not microservices.
3. **Collect evidence before adding AI:** Diagnostics must rely on observable data.
4. **Be integration-friendly:** Monitoring should not be tied to Java applications.
5. **Fail safely:** One unavailable endpoint should not compromise the monitoring service.
6. **Monitor responsibly:** Restrict outbound checks to approved targets and avoid exposing secrets in telemetry.

## Contributing

Sentinel is an early-stage learning and open-source project. Contribution guidelines, issue templates, and coding conventions will be added as the implementation grows.

## License

A license has not yet been selected. **The source will not be considered open-source licensed until an explicit LICENSE file is added.**

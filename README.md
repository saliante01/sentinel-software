# Sentinel

Open-source application monitoring and anomaly detection, built with Java and Spring Boot.

See [`readme2.md`](readme2.md) for the full project context, scope, data model, and roadmap.

## Repository layout

```text
sentinel-software/
├── backend/    Spring Boot REST API (Java 21)
├── frontend/   Reserved for the web interface (framework not chosen yet)
└── readme2.md  Project planning document
```

## Backend requirements

- JDK 21
- Maven Wrapper (included in the repository)
- No external database required: H2 runs in file mode

Check your Java version:

```bash
java -version
```

If Java 21 is not the default on macOS, point Maven to it:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

## Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

The API starts at `http://localhost:8080`.

Run the tests:

```bash
cd backend
./mvnw test
```

## H2 database console

- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/sentinel`
- User: `sa`
- Password: *(empty)*

The database file is created under `backend/data/` and is ignored by Git.

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Service health |
| GET | `/api/applications` | List monitored applications |
| GET | `/api/applications/{id}` | Get one application |
| POST | `/api/applications` | Register an application |
| DELETE | `/api/applications/{id}` | Delete an application |

Create an application:

```bash
curl -X POST http://localhost:8080/api/applications \
  -H 'Content-Type: application/json' \
  -d '{"name":"Example","url":"https://example.com"}'
```

List applications:

```bash
curl http://localhost:8080/api/applications
```

Validation errors and missing applications are returned as RFC 9457 `application/problem+json` responses.

## Current status

- [x] Stage 0 — Bootstrap and basic JSON endpoint
- [x] Stage 1 — REST basics
- [x] Stage 2 — In-memory registration (implemented with H2 persistence)
- [x] Stage 3 — Application management (list, lookup, delete)
- [ ] Stage 4 — Manual health checks
- [ ] Stage 5 — PostgreSQL and migrations
- [ ] Stage 6 — Scheduling
- [ ] Stage 7 — History
- [ ] Stage 8 — Quality and documentation

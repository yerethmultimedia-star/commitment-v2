# Observabilidad

## Current State

The backend runs a real OpenTelemetry SDK (`apps/backend/src/otel.ts`), started before Nest itself boots (`main.ts`). It registers `HttpInstrumentation`, `ExpressInstrumentation`, and `NestInstrumentation` (auto-instrumentation, not manual spans), exports traces via OTLP HTTP to the collector (`${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`, default `http://localhost:4318` — matches the running `otel-collector` container), and runs an embedded Prometheus exporter on port 9464.

`ObservabilityModule` (`apps/backend/src/observability/observability.module.ts`) registers real custom metrics via `@willsoto/nestjs-prometheus`: two histograms (`command_duration_ms`, `http_request_duration_ms`) and five counters (`commitments_created_total`, `goals_created_total`, `notifications_sent_total`, `outbox_deadletter_total`, `processed_messages_total`).

`docker/prometheus/prometheus.yml` actually scrapes `host.docker.internal:9464` (job `backend-service`) — confirmed, this is not a dangling config pointing nowhere. `docker/grafana/provisioning/` contains exactly one file, `datasources/datasource.yml` — no dashboard JSON exists anywhere in the provisioning tree.

Logging uses `nestjs-pino` consistently; `console.log`/`console.error` calls exist only in `main.ts` (bootstrap, before the Pino logger is constructed) — an expected, isolated exception, not a broader pattern. No Alertmanager or Grafana alert rules exist anywhere in `docker-compose.yml` or the provisioning tree. `apps/mobile/package.json` has no Sentry/Bugsnag/Crashlytics dependency — zero client-side crash or error reporting.

## Strengths

- **Tracing is genuinely wired, not a no-op SDK start.** The exporter URL, service name, and instrumentations are all real and match the actually-running `otel-collector` container's ports — verified by reading `otel.ts` directly, not inferred from the SDK merely being imported.
- **Prometheus scraping is real and correctly targeted.** `prometheus.yml`'s `backend-service` job points at the exact port (`9464`) the backend's embedded `PrometheusExporter` listens on. This is the first "infra + wiring" pair in this entire review (across 13 prior iterations) confirmed to actually connect end-to-end without a dead link somewhere in the middle.
- **The custom counters are domain-relevant, not generic boilerplate** (`commitments_created_total`, `goals_created_total`, `notifications_sent_total`, `outbox_deadletter_total`) — someone thought about what would actually matter to watch, not just wrapped default Node.js process metrics.
- **`http_request_duration_ms` is globally wired**, not opt-in per controller: `MetricsInterceptor` is registered via `APP_INTERCEPTOR` in `app.module.ts:81-82`, so every HTTP request is measured, confirmed by direct inspection of the module providers array.

## Weaknesses

- **`command_duration_ms` — the histogram, and its `CommandMetricsInterceptor`, are dead code.** `CommandMetricsInterceptor` (`observability/interceptors/command-metrics.interceptor.ts`) is well-built and correctly implemented (uses `context.getClass().name`/`getHandler().name` to label the metric per command), but a repo-wide grep for its class name found exactly one hit: its own definition. It is never registered as a global interceptor, never applied to any controller, never instantiated anywhere. The histogram exists in Prometheus's metric registry (via `makeHistogramProvider`) but will report zero observations forever, because nothing ever calls `.startTimer()` on it in practice.
- **Zero Grafana dashboards exist.** Metrics flow into Prometheus (confirmed above), but nobody has built a single panel to look at any of them. This is infrastructure genuinely working, paired with total absence of anyone (or anything) actually consuming the signal it produces.
- **Zero frontend/mobile observability.** No crash reporting, no client-side error tracking, no mobile analytics dependency exists anywhere in `apps/mobile/package.json`. If a user's mobile app crashes or throws silently, nothing is ever recorded — this is a real blind spot distinct from (and not covered by) the backend's otherwise-real tracing/metrics story.
- **No alerting exists anywhere** — no Alertmanager config, no Grafana alert rules.

## Risks

- The dead `command_duration_ms` metric is a trap for a future reader: it looks configured and present in the metrics registry, so someone debugging slow commands later might reasonably assume it's populated and waste time looking at a permanently-empty graph before discovering the interceptor was never wired.
- Zero mobile error visibility means the team's only way to learn about a client-side production issue would be a user reporting it directly — for a product whose stated audience includes people prone to abandoning apps at the first friction (`PRODUCT_VISION.md` Target Audience), silent crashes are a real risk to retention that nothing here would ever surface.
- The absence of alerting is not itself a current risk (see Priority below) — flagged here only so it's not silently forgotten once real traffic exists.

## Technical Debt

- `CommandMetricsInterceptor` needs one line added to `app.module.ts`'s `APP_INTERCEPTOR` providers (mirroring exactly how `MetricsInterceptor` is already wired) to stop being dead code.
- No Grafana dashboard exists for any of the 7 real metrics already flowing into Prometheus — the data is there, only the visualization layer is missing.
- No mobile crash/error reporting integration exists at all.

## Recommendations

1. Wire `CommandMetricsInterceptor` as a global `APP_INTERCEPTOR`, identical in form to `MetricsInterceptor`'s existing registration — this is a near-zero-effort fix that activates an already-built, already-correct piece of observability.
2. Build at least one Grafana dashboard covering the 7 existing metrics before considering this area "done" — the instrumentation work already paid for is currently producing signal nobody can see without hand-querying Prometheus.
3. Add a mobile crash/error reporting integration (e.g. Sentry) before any real (non-demo, non-single-developer) usage — this is the one piece of this iteration's findings that represents a real, currently-unmitigated gap rather than an underused asset.
4. Do not build alerting yet — correctly proportionate to skip for a pre-production system with no real traffic; revisit once real users exist.

## Priority

**Medium.** This iteration breaks this review's repeated "infrastructure present, never truly exercised" pattern in one specific, verifiable way — the backend's trace/metrics pipeline actually works end-to-end, which is new and worth crediting. But three of the four weaknesses found are essentially free to fix (one interceptor registration line, dashboards over already-flowing data) and the fourth (mobile crash reporting) is a real gap that should close before real users arrive, not urgently but deliberately.

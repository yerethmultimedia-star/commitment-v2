import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { env } from './config/env.config';
// Configurar el exportador de trazas OTLP HTTP
const traceExporter = new OTLPTraceExporter({
  url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
});

// Configurar el exportador de Prometheus (servidor embebido para scraping de métricas)
const metricExporter = new PrometheusExporter(
  {
    port: 9464,
  },
  () => {
    // eslint-disable-next-line no-console
    console.log('📈 Prometheus metrics server started on port 9464');
  },
);

export const otelSDK = new NodeSDK({
  resource: resourceFromAttributes({
    'service.name': env.OTEL_SERVICE_NAME,
  }),
  traceExporter,
  metricReader: metricExporter,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
  ],
});

// Registrar el apagado correcto del SDK de OTel al recibir señales de término
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      // eslint-disable-next-line no-console
      () => console.log('SDK de OpenTelemetry apagado exitosamente'),
      // eslint-disable-next-line no-console
      (err) => console.error('Error apagando SDK de OpenTelemetry', err),
    )
    .finally(() => process.exit(0));
});

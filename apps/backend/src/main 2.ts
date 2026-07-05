import { otelSDK } from './otel';
// Iniciar el SDK de OpenTelemetry antes de cualquier otro módulo para asegurar tracing completo
otelSDK.start();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env.config';
import { ProblemDetailsExceptionFilter } from './filters/problem-details-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors();

  // Prefijo global de API (/v1)
  app.setGlobalPrefix('v1');

  // Filtro global de excepciones RFC 9457 (Problem Details)
  app.useGlobalFilters(new ProblemDetailsExceptionFilter());

  // Configuración de OpenAPI (Swagger)
  const config = new DocumentBuilder()
    .setTitle('Commitment v2 API')
    .setDescription(
      'API core de Commitment v2 para la gestión de compromisos e historial adaptativo.',
    )
    .setVersion('1.0')
    .addTag('Commitment')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = env.PORT;
  await app.listen(port);

  console.log(`🚀 NestJS Backend running on port ${port}`);

  console.log(
    `📑 Documentación de Swagger disponible en: http://localhost:${port}/api/docs`,
  );
}
bootstrap().catch((err) => {
  console.error('❌ Error fatal iniciando la aplicación NestJS:', err);
  process.exit(1);
});

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DomainExceptionFilter } from './web/filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS usando la variable de entorno BASE_URL (URL del Frontend)
  app.enableCors({
    origin: process.env.BASE_URL || 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.use(cookieParser());
  app.useGlobalFilters(new DomainExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Kan-Todo API')
    .setDescription('The Kan-Todo API description')
    .setVersion('1.0')
    .addBearerAuth() // Soporte para Bearer Token
    .addCookieAuth('access_token') // Soporte para Cookie httpOnly
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();

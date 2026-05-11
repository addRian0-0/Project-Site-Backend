import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  // Escuchamos en el 3001 para evitar bloqueos del 3000
  await app.listen(8080, '0.0.0.0');
  console.log('SERVIDOR CORRIENDO EN: http://localhost:8080/graphql');
}
bootstrap();

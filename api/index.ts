import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let appPromise: Promise<any> | null = null;

async function getExpressApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const app = await NestFactory.create(AppModule);
      app.enableCors({
        origin: true,
        credentials: true,
      });
      await app.init();
      return app.getHttpAdapter().getInstance();
    })();
  }

  return appPromise;
}

export default async function handler(req: any, res: any) {
  const expressApp = await getExpressApp();
  return expressApp(req, res);
}

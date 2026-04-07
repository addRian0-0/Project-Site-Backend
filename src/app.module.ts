// --- Imports generales ---
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// --- Módulos de funcionalidad ---
import { PrismaModule } from './prisma/prisma.module';
import { AlumnoModule } from './alumno/alumno.module';
import { ContenidoModule } from './contenido/contenido.module';
import { UnidadModule } from './unidad/unidad.module';
import { RubricaModule } from './rubrica/rubrica.module';
import { InsigniaModule } from './insignia/insignia.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrismaModule,
    AlumnoModule,
    ContenidoModule,
    UnidadModule,
    RubricaModule,
    InsigniaModule,

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { ContenidoResolver } from './contenido.resolver';
import { ContenidoService } from './contenido.service';

@Module({
  providers: [ContenidoResolver, ContenidoService],
})
export class ContenidoModule {}

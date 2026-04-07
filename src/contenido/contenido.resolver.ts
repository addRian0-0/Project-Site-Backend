import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Contenido } from './entities/contenido.entity';
import { ContenidoService } from './contenido.service';

@Resolver(() => Contenido)
export class ContenidoResolver {
  constructor(private readonly contenidoService: ContenidoService) {}

  @Query(() => [Contenido], { name: 'contenidos' })
  findAll() {
    return this.contenidoService.findAll();
  }

  @Query(() => Contenido, { name: 'contenido', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.contenidoService.findOne(id);
  }
}

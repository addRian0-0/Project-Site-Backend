import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UnidadService } from './unidad.service';
import { Unidad } from './entities/unidad.entity';
import { CreateUnidadInput } from './dto/create-unidad.input';
import { UpdateUnidadInput } from './dto/update-unidad.input';
import { TipoMateria } from '../contenido/entities/contenido.entity';

@Resolver(() => Unidad)
export class UnidadResolver {
  constructor(private readonly unidadService: UnidadService) {}

  // Consulta para el menú principal (TRAE TODO)
  @Query(() => [Unidad], { name: 'unidades' }) 
  findAll(
    @Args('tipoMateria', { type: () => TipoMateria, nullable: true })
    tipoMateria?: TipoMateria,
  ) {
    return this.unidadService.findAll(tipoMateria);
  }

  // Consulta para ver un tema específico (TRAE UNA)
  @Query(() => Unidad, { name: 'unidad', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.unidadService.findOne(id);
  }

  @Mutation(() => Unidad)
  createUnidad(@Args('createUnidadInput') createUnidadInput: CreateUnidadInput) {
    return this.unidadService.create(createUnidadInput);
  }

  @Mutation(() => Unidad)
  updateUnidad(@Args('updateUnidadInput') updateUnidadInput: UpdateUnidadInput) {
    return this.unidadService.update(updateUnidadInput.id, updateUnidadInput);
  }

  @Mutation(() => Unidad)
  removeUnidad(@Args('id', { type: () => Int }) id: number) {
    return this.unidadService.remove(id);
  }
}

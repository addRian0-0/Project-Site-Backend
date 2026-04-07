import { ObjectType, Field, Int, ID, registerEnumType } from '@nestjs/graphql';
import { TipoContenido } from '@prisma/client';
import { Unidad } from '../../unidad/entities/unidad.entity';

registerEnumType(TipoContenido, {
  name: 'TipoContenido',
});

@ObjectType()
export class Contenido {
  @Field(() => ID)
  id: number;

  @Field()
  titulo: string;

  @Field()
  descripcion: string;

  @Field(() => TipoContenido, { nullable: true })
  tipo?: TipoContenido;

  @Field(() => Int)
  unidadId: number;

  @Field(() => Unidad, { nullable: true })
  unidad?: Unidad;
}

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Contenido } from '../../contenido/entities/contenido.entity';

@ObjectType({ description: 'Entidad que representa a un alumno del sistema' })
export class Alumno {
  @Field(() => Int)
  id: number;

  @Field()
  nombre: string;

  @Field()
  apellido: string;

  @Field()
  email: string;

  @Field()
  grupo: string;

  @Field(() => [Contenido], { nullable: true })
  contenidosCompletados?: Contenido[];
}

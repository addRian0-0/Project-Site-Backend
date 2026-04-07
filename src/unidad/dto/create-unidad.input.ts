import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUnidadInput {
  @Field()
  nombre: string;
}

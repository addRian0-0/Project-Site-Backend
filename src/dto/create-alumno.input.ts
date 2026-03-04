import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAlumnoInput {
    @Field()
    nombre: string;

    @Field()
    email: string;
}
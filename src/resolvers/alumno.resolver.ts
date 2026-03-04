// IMPORTS
import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { Alumno } from '../entities/alumno.entity';
import { Contenido } from '../entities/contenido.entity';
import { CreateAlumnoInput } from '../dto/create-alumno.input';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Resolver(() => Alumno)
export class AlumnoResolver {
    
@Query(() => [Alumno], { name: 'alumnos' })
async getAlumnos() {
  // Le pedimos a Prisma que busque en la tabla real de PostgreSQL
  return await prisma.alumno.findMany();
}

@Mutation(() => Alumno, { name: 'crearAlumno' })
async crearAlumno(@Args('datos') datos: CreateAlumnoInput) {
  return await prisma.alumno.create({
    data: {
      nombre: datos.nombre,
      email: datos.email
    }
  });
}



    @Mutation(() => Alumno, { nullable: true })
    async completarContenido(
        @Args('alumnoId', { type: () => Int }) alumnoId: number,
        @Args('contenidoId', { type: () => Int }) contenidoId: number,
    ) {
        console.log(`El alumno ${alumnoId} compleo el contenido ${contenidoId}`);
        return null; 
    }

    @ResolveField(() => [Contenido])
    async contenidosCompletados(@Parent() alumno: Alumno) {
        if (alumno.id === 1) {
            return [{ id: 101, titulo: 'Introduccion a Compiladores' }];
        }
        return [];
    }



}
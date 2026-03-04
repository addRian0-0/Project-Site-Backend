// IMPORTS
import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { Alumno } from '../entities/alumno.entity';
import { Contenido } from '../entities/contenido.entity';
import { CreateAlumnoInput } from '../dto/create-alumno.input';

@Resolver(() => Alumno)
export class AlumnoResolver {
    
    @Query(() => [Alumno], { name: 'alumnos' })
    getAlumnos() {
        return [
            { id: 1, nombre: 'Ignacio Herrera', email: 'nacho@ejemplo.com' },
            { id: 2, nombre: 'Ricardo Aguas', email: 'richi@ejemplo.com' }
        ];
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

    // Aqui simulamos el guardado en la DB de Supabase
    @Mutation(() => Alumno)
    async crearAlumno(
    @Args('datos') datos: CreateAlumnoInput,
    ) {
    
    const nuevoAlumno = {
        id: Math.floor(Math.random() * 1000), // ID aleatorio
        nombre: datos.nombre,
        email: datos.email,
    };
    
    console.log('Nuevo alumno creado:', nuevoAlumno);
    return nuevoAlumno;
    }
}
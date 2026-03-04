// IMPORTS
import { Resolver, Query, ResolveField, Parent } from '@nestjs/graphql';
import { Unidad } from '../entities/unidad.entity';
import { Contenido } from '../entities/contenido.entity';

@Resolver(() => Unidad)
export class UnidadResolver {
    @Query(() => [Unidad], { name: 'unidades' })
    async getUnidades() {
        // Datos de prueba
        return [
        { id: 1, nombre: 'Unidad 1: Introducción', descripcion: 'Conceptos básicos de compiladores' }
        ];
    }

    @ResolveField(() => [Contenido])
    async contenidos(@Parent() unidad: Unidad) {
        // Datos simulan la relacion 1:N
        return [
        { id: 101, titulo: 'Introducción a compiladores', descripcion: 'Conceptos basicos.' },
        { id: 102, titulo: 'Practica 1', descripcion: 'Subir el archivo .flex aqua.' }
        ];
    }
}
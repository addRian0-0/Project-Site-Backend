// IMPORTS
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Contenido, TipoContenido } from '../entities/contenido.entity';

@Resolver(() => Contenido)
export class ContenidoResolver {

    @Query(() => [Contenido], { name: 'contenidos' })
    async getContenidos() {
        return [
        { id: 101, titulo: 'Introduccion a compiladores', descripcion: 'Conceptos basicos.' },
        { id: 102, titulo: 'Practica 1', descripcion: 'Subir el archivo .flex aqui.' }
        ];
    }

    @Query(() => Contenido, { name: 'contenido', nullable: true })
    async getContenidoById(@Args('id', { type: () => Int }) id: number) {
        // Ejemplo de busqueda por ID
        return {
            contenido_id: id,
            titulo: 'Contenido específico',
            descripcion: 'Buscaste el ID ' + id,
            tipo: TipoContenido.RECURSO,
            unidad_id: 1,
        };
    }
    
}
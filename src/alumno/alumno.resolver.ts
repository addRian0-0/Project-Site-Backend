import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { Alumno } from './entities/alumno.entity';
import { Contenido } from '../contenido/entities/contenido.entity';
import { CreateAlumnoInput } from './dto/create-alumno.input';
import { LoginAlumnoInput } from './dto/login-alumno.input';
import { AlumnoService } from './alumno.service';

@Resolver(() => Alumno)
export class AlumnoResolver {
  constructor(private readonly alumnoService: AlumnoService) {}

  @Query(() => [Alumno], { name: 'alumnos' })
  getAlumnos() {
    return this.alumnoService.findAll();
  }

  @Mutation(() => Alumno, { name: 'crearAlumno' })
  crearAlumno(@Args('datos') datos: CreateAlumnoInput) {
    return this.alumnoService.create(datos);
  }

  @Mutation(() => Alumno, { name: 'iniciarSesion' })
  iniciarSesion(@Args('datos') datos: LoginAlumnoInput) {
    return this.alumnoService.login(datos);
  }

  @Mutation(() => Alumno, { nullable: true })
  async completarContenido(
    @Args('alumnoId', { type: () => Int }) alumnoId: number,
    @Args('contenidoId', { type: () => Int }) contenidoId: number,
  ) {
    console.log(`El alumno ${alumnoId} completó el contenido ${contenidoId}`);
    return null;
  }

  @ResolveField(() => [Contenido])
  async contenidosCompletados(@Parent() alumno: Alumno): Promise<Contenido[]> {
    return [];
  }
}

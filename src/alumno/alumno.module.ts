import { Module } from '@nestjs/common';
import { AlumnoResolver } from './alumno.resolver';
import { AlumnoService } from './alumno.service';

@Module({
  providers: [AlumnoResolver, AlumnoService],
})
export class AlumnoModule {}

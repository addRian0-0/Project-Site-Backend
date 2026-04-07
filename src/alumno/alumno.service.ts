import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlumnoInput } from './dto/create-alumno.input';

@Injectable()
export class AlumnoService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.alumno.findMany();
  }

  create(datos: CreateAlumnoInput) {
    return this.prisma.alumno.create({ data: datos });
  }
}

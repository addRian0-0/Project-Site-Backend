import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlumnoInput } from './dto/create-alumno.input';
import { LoginAlumnoInput } from './dto/login-alumno.input';

@Injectable()
export class AlumnoService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.alumno.findMany();
  }

  async create(datos: CreateAlumnoInput) {
    const alumnoExistente = await this.prisma.alumno.findUnique({
      where: { email: datos.email.toLowerCase().trim() },
    });

    if (alumnoExistente) {
      throw new BadRequestException('El correo ya está registrado');
    }

    return this.prisma.alumno.create({
      data: {
        ...datos,
        email: datos.email.toLowerCase().trim(),
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        grupo: datos.grupo.trim(),
        password: datos.password,
      },
    });
  }

  async login(datos: LoginAlumnoInput) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { email: datos.email.toLowerCase().trim() },
    });

    if (!alumno) {
      throw new UnauthorizedException('El usuario no existe');
    }

    if (alumno.password !== datos.password) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    return alumno;
  }
}

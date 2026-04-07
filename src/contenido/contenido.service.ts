import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContenidoService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.contenido.findMany();
  }

  findOne(id: number) {
    return this.prisma.contenido.findUnique({ where: { id } });
  }
}

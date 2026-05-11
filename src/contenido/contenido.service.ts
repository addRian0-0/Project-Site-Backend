import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoMateria } from './entities/contenido.entity';

@Injectable()
export class ContenidoService {
  constructor(private prisma: PrismaService) {}

  async findAll(tipoMateria?: TipoMateria) {
    const contenidos = await this.prisma.contenido.findMany({
      where: tipoMateria ? { tipoMateria } : undefined,
    });

    return contenidos.map((contenido) => ({
      ...contenido,
      tipoMateria:
        (contenido as { tipoMateria?: TipoMateria }).tipoMateria ??
        TipoMateria.TEORIA_DE_LENGUAJES,
    }));
  }

  async findOne(id: number) {
    const contenido = await this.prisma.contenido.findUnique({ where: { id } });

    if (!contenido) {
      return null;
    }

    return {
      ...contenido,
      tipoMateria:
        (contenido as { tipoMateria?: TipoMateria }).tipoMateria ??
        TipoMateria.TEORIA_DE_LENGUAJES,
    };
  }
}

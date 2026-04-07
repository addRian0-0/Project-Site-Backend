import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnidadInput } from './dto/create-unidad.input';
import { UpdateUnidadInput } from './dto/update-unidad.input';

@Injectable()
export class UnidadService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.unidad.findMany({
      include: { contenidos: { orderBy: { orden: 'asc' } } },
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.unidad.findUnique({
      where: { id },
      include: { contenidos: true },
    });
  }

  create(createUnidadInput: CreateUnidadInput) {
    return this.prisma.unidad.create({ data: createUnidadInput });
  }

  update(id: number, updateUnidadInput: UpdateUnidadInput) {
    return this.prisma.unidad.update({ where: { id }, data: updateUnidadInput });
  }

  remove(id: number) {
    return this.prisma.unidad.delete({ where: { id } });
  }
}
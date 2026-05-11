import { PrismaClient, TipoContenido, TipoMateria } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as vm from 'vm';

type MockContenido = {
  contenido_id: number;
  titulo: string;
  area: string;
  descripcion: string;
  tipo: string;
  orden: number;
  url_recurso: string | null;
  unidad_id: number;
  unidad: {
    unidad_id: number;
    nombre: string;
  };
  contenido: string[];
};

const prisma = new PrismaClient();

const AREA_TO_TIPO_MATERIA: Record<string, TipoMateria> = {
  Compiladores: TipoMateria.COMPILADORES,
  'Teoría de la Computación.': TipoMateria.TEORIA_DE_LA_COMPUTACION,
  'Teoría de Lenguajes': TipoMateria.TEORIA_DE_LENGUAJES,
};

const UNIT_ID_OFFSET: Record<TipoMateria, number> = {
  [TipoMateria.TEORIA_DE_LA_COMPUTACION]: 0,
  [TipoMateria.COMPILADORES]: 100,
  [TipoMateria.TEORIA_DE_LENGUAJES]: 200,
};

function cargarMock(): MockContenido[] {
  const mockPath = resolve(process.cwd(), '../compiladores/src/data/mockGuionDidactico.js');
  const rawSource = readFileSync(mockPath, 'utf8');
  const scriptSource = `
    const AreaComputacion = {
      TEORIA_DE_LENGUAJES: 'Teoría de Lenguajes',
      COMPILADORES: 'Compiladores',
      TEORIA_COMPUTACION: 'Teoría de la Computación.'
    };
  `
    .concat(
      rawSource
    .replace(/import\s+\{\s*AreaComputacion\s*\}\s+from\s+["'][^"']+["'];?/, '')
    .replace(/export\s+const\s+/g, 'const ')
    )
    .concat('\nmodule.exports = { CONTENIDOS_MOCK };');

  const sandbox = {
    module: { exports: {} as { CONTENIDOS_MOCK?: MockContenido[] } },
    exports: {},
  };

  vm.runInNewContext(scriptSource, sandbox, { filename: mockPath });

  return sandbox.module.exports.CONTENIDOS_MOCK ?? [];
}

function normalizarTipoContenido(tipo: string): TipoContenido {
  switch (tipo.toUpperCase()) {
    case TipoContenido.RECURSO:
      return TipoContenido.RECURSO;
    case TipoContenido.TAREA:
      return TipoContenido.TAREA;
    case TipoContenido.LECCION:
    default:
      return TipoContenido.LECCION;
  }
}

function limpiarTexto(texto: string | null | undefined) {
  if (typeof texto !== 'string') {
    return texto ?? null;
  }

  return texto.replace(/\u0000/g, '');
}

function construirDatos(mock: MockContenido[]) {
  const unidades = new Map<number, { id: number; nombre: string }>();
  const contenidos = mock.map((item) => {
    const tipoMateria = AREA_TO_TIPO_MATERIA[item.area];

    if (!tipoMateria) {
      throw new Error(`Area no soportada en mock: ${item.area}`);
    }

    const unidadId = UNIT_ID_OFFSET[tipoMateria] + item.unidad_id;

    if (!unidades.has(unidadId)) {
      unidades.set(unidadId, {
        id: unidadId,
        nombre: item.unidad.nombre,
      });
    }

    return {
      titulo: limpiarTexto(item.titulo) ?? '',
      descripcion: limpiarTexto(item.descripcion) ?? '',
      tipo: normalizarTipoContenido(item.tipo),
      tipoMateria,
      orden: item.orden,
      url_recurso: limpiarTexto(item.url_recurso),
      contenido: item.contenido.map((bloque) => limpiarTexto(bloque) ?? ''),
      unidadId,
    };
  });

  return {
    unidades: [...unidades.values()].sort((a, b) => a.id - b.id),
    contenidos,
  };
}

async function sembrarUnidades(unidades: { id: number; nombre: string }[]) {
  for (const unidad of unidades) {
    await prisma.unidad.upsert({
      where: { id: unidad.id },
      update: { nombre: unidad.nombre },
      create: unidad,
    });
  }
}

async function sembrarContenidos(
  contenidos: {
    titulo: string;
    descripcion: string;
    tipo: TipoContenido;
    tipoMateria: TipoMateria;
    orden: number;
    url_recurso: string | null;
    contenido: string[];
    unidadId: number;
  }[],
) {
  await prisma.contenido.deleteMany({
    where: {
      tipoMateria: {
        in: [TipoMateria.TEORIA_DE_LA_COMPUTACION, TipoMateria.COMPILADORES],
      },
    },
  });

  await prisma.contenido.createMany({
    data: contenidos,
  });
}

async function sembrarInsignias() {
  await prisma.insignia.createMany({
    data: [
      {
        nombre: 'Primer Paso',
        nivel: 'Bronce',
        descripcion: 'Completaste tu primer contenido del curso.',
        icon: '🥉',
        color: '#cd7f32',
        requisito: 1,
      },
      {
        nombre: 'En Camino',
        nivel: 'Bronce',
        descripcion: 'Completaste 5 contenidos.',
        icon: '📚',
        color: '#cd7f32',
        requisito: 5,
      },
      {
        nombre: 'Mitad del Camino',
        nivel: 'Plata',
        descripcion: 'Completaste 9 contenidos.',
        icon: '🥈',
        color: '#c0c0c0',
        requisito: 9,
      },
      {
        nombre: 'Casi Experto',
        nivel: 'Plata',
        descripcion: 'Completaste 14 contenidos.',
        icon: '⚡',
        color: '#c0c0c0',
        requisito: 14,
      },
      {
        nombre: 'Compilador Master',
        nivel: 'Oro',
        descripcion: 'Completaste todos los contenidos del curso.',
        icon: '🥇',
        color: '#ffd700',
        requisito: 18,
      },
    ],
    skipDuplicates: true,
  });
}

async function main() {
  console.log('🌱 Sincronizando contenidos desde compiladores/src/data/mockGuionDidactico.js');

  const mock = cargarMock();
  const { unidades, contenidos } = construirDatos(mock);

  await sembrarUnidades(unidades);
  await sembrarContenidos(contenidos);
  await sembrarInsignias();

  console.log(`✅ Seed completado: ${unidades.length} unidades y ${contenidos.length} contenidos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

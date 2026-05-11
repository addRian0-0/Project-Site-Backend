import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';

const { Pool } = require('pg');

type QueryArgs = {
  where?: Record<string, unknown>;
  data?: any;
  include?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc' | Record<string, 'asc' | 'desc'>>;
};

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly databaseUrl = this.getDatabaseUrl();

  private readonly pool = new Pool({
    connectionString: this.databaseUrl,
  });

  readonly contenido = {
    findMany: async (args?: QueryArgs) => this.findContenidosByTipoMateria(args?.where?.tipoMateria),
    findUnique: async ({ where }: QueryArgs) =>
      this.findContenidoById(Number(where?.id)),
  };

  readonly unidad = {
    findMany: async (args?: QueryArgs) => this.findUnidades(args),
    findUnique: async ({ where, include }: QueryArgs) =>
      this.findUnidadById(Number(where?.id), Boolean(include?.contenidos)),
    create: async ({ data }: QueryArgs) => this.createUnidad(data),
    update: async ({ where, data }: QueryArgs) =>
      this.updateUnidad(Number(where?.id), data),
    delete: async ({ where }: QueryArgs) => this.deleteUnidad(Number(where?.id)),
  };

  readonly alumno = {
    findMany: async () =>
      this.queryRows(
        'SELECT id, nombre, apellido, email, grupo, password FROM "Alumno" ORDER BY id ASC',
      ),
    findUnique: async ({ where }: QueryArgs) => {
      if (where?.email) {
        return this.queryOne(
          'SELECT id, nombre, apellido, email, grupo, password FROM "Alumno" WHERE email = $1',
          [where.email],
        );
      }

      if (where?.id) {
        return this.queryOne(
          'SELECT id, nombre, apellido, email, grupo, password FROM "Alumno" WHERE id = $1',
          [where.id],
        );
      }

      return null;
    },
    create: async ({ data }: QueryArgs) =>
      this.queryOne(
        `
          INSERT INTO "Alumno" (nombre, apellido, email, grupo, password)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, nombre, apellido, email, grupo, password
        `,
        [data?.nombre, data?.apellido, data?.email, data?.grupo, data?.password],
      ),
  };

  readonly insignia = {
    findMany: async () =>
      this.queryRows(
        'SELECT id, nombre, nivel, descripcion, icon, color, requisito FROM "Insignia" ORDER BY id ASC',
      ),
  };

  readonly rubrica = {
    findMany: async ({ where }: QueryArgs) =>
      this.queryRows(
        'SELECT id, titulo, criterios, url, periodo FROM "Rubrica" WHERE periodo = $1 ORDER BY id ASC',
        [where?.periodo],
      ),
  };

  async onModuleInit() {
    await this.ensureAlumnoSchema();
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  private async findContenidos() {
    return this.findContenidosByTipoMateria();
  }

  private async findContenidosByTipoMateria(tipoMateria?: unknown) {
    const whereClause = typeof tipoMateria === 'string' ? 'WHERE "tipoMateria" = $1' : '';
    const params = typeof tipoMateria === 'string' ? [tipoMateria] : [];

    return this.queryRows(`
      SELECT
        id,
        titulo,
        descripcion,
        tipo,
        "tipoMateria",
        orden,
        url_recurso,
        contenido,
        "unidadId"
      FROM "Contenido"
      ${whereClause}
      ORDER BY "unidadId" ASC, orden ASC, id ASC
    `, params);
  }

  private async findContenidoById(id: number) {
    return this.queryOne(
      `
        SELECT
          id,
          titulo,
          descripcion,
          tipo,
          "tipoMateria",
          orden,
          url_recurso,
          contenido,
          "unidadId"
        FROM "Contenido"
        WHERE id = $1
      `,
      [id],
    );
  }

  private async findUnidades(args?: QueryArgs) {
    const tipoMateria = args?.where?.tipoMateria;
    const unidades =
      typeof tipoMateria === 'string'
        ? await this.queryRows(
            `
              SELECT DISTINCT u.id, u.nombre
              FROM "Unidad" u
              INNER JOIN "Contenido" c ON c."unidadId" = u.id
              WHERE c."tipoMateria" = $1
              ORDER BY u.id ASC
            `,
            [tipoMateria],
          )
        : await this.queryRows('SELECT id, nombre FROM "Unidad" ORDER BY id ASC');

    if (!args?.include?.contenidos) {
      return unidades;
    }

    const contenidos = await this.findContenidosByTipoMateria(tipoMateria);
    return unidades.map((unidad) => ({
      ...unidad,
      contenidos: contenidos
        .filter((contenido) => contenido.unidadId === unidad.id)
        .map((contenido) => ({
          ...contenido,
          unidad,
        })),
    }));
  }

  private async findUnidadById(id: number, includeContenidos: boolean) {
    const unidad = await this.queryOne('SELECT id, nombre FROM "Unidad" WHERE id = $1', [
      id,
    ]);

    if (!unidad || !includeContenidos) {
      return unidad;
    }

    const contenidos = await this.queryRows(
      `
        SELECT
          id,
          titulo,
          descripcion,
          tipo,
          "tipoMateria",
          orden,
          url_recurso,
          contenido,
          "unidadId"
        FROM "Contenido"
        WHERE "unidadId" = $1
        ORDER BY orden ASC, id ASC
      `,
      [id],
    );

    return { ...unidad, contenidos };
  }

  private async createUnidad(data?: any) {
    return this.queryOne('INSERT INTO "Unidad" (nombre) VALUES ($1) RETURNING id, nombre', [
      data?.nombre,
    ]);
  }

  private async updateUnidad(id: number, data?: any) {
    return this.queryOne(
      'UPDATE "Unidad" SET nombre = COALESCE($1, nombre) WHERE id = $2 RETURNING id, nombre',
      [data?.nombre, id],
    );
  }

  private async deleteUnidad(id: number) {
    return this.queryOne('DELETE FROM "Unidad" WHERE id = $1 RETURNING id, nombre', [id]);
  }

  private async queryRows(sql: string, params: unknown[] = []) {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  private async queryOne(sql: string, params: unknown[] = []) {
    const result = await this.pool.query(sql, params);
    return result.rows[0] ?? null;
  }

  private getDatabaseUrl() {
    if (process.env.DATABASE_URL) {
      return process.env.DATABASE_URL;
    }

    if (!existsSync('.env')) {
      return undefined;
    }

    const env = readFileSync('.env', 'utf8');
    return env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
  }

  private async ensureAlumnoSchema() {
    await this.pool.query(`
      ALTER TABLE "Alumno"
      ADD COLUMN IF NOT EXISTS apellido TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS grupo TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT ''
    `);
  }
}

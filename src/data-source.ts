import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as path from 'path';

const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();
const isPostgres = DB_TYPE === 'postgres';
const host = process.env.DB_HOST || 'postgres';
const port = Number(process.env.DB_PORT || 5432);
const username = process.env.DB_USERNAME || process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || process.env.DB_PASS || 'postgres';
const database = process.env.DB_DATABASE || process.env.DB_NAME || 'estate_app';
const sqlitePath = process.env.SQLITE_PATH || './data/estate.sqlite';
const sqliteSync = process.env.SQLITE_SYNC === 'true' || process.env.SQLITE_SYNC === '1';

export const AppDataSource = new DataSource(
  isPostgres
    ? {
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
        migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
        synchronize: false,
        logging: true,
      }
    : {
        type: 'sqlite',
        database: path.resolve(process.cwd(), sqlitePath),
        entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
        migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
        synchronize: sqliteSync,
        logging: true,
      },
);

AppDataSource.initialize()
  .then(() => {
    console.log(`✅ Data Source initialized (${isPostgres ? 'Postgres' : 'SQLite'})`);
    console.log('Entities loaded:', AppDataSource.entityMetadatas.map((e) => e.name));
  })
  .catch((err) => {
    console.error('❌ Error during Data Source init:', err);
  });

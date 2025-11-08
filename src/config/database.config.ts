import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import * as net from 'net';

export const getDatabaseConfig = async (): Promise<TypeOrmModuleOptions> => {
  const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

  const host = process.env.DB_HOST || 'postgres';
  const port = Number(process.env.DB_PORT) || 5432;
  const username = process.env.DB_USERNAME || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const database = process.env.DB_DATABASE || 'estate_app';

  const tryPostgres = dbType === 'postgres' || dbType === 'auto';

  // 🧠 Try detecting PostgreSQL before connecting
  if (tryPostgres) {
    const isPostgresAvailable = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      socket
        .setTimeout(1000)
        .once('connect', () => {
          socket.destroy();
          resolve(true);
        })
        .once('error', () => resolve(false))
        .once('timeout', () => resolve(false))
        .connect(port, host);
    });

    if (isPostgresAvailable) {
      console.log('✅ PostgreSQL detected and will be used.');
      return {
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        autoLoadEntities: true,
        synchronize: process.env.SYNC_SCHEMA === 'true', // false in prod
        logging: true,
      };
    } else {
      console.warn('⚠️ PostgreSQL not reachable — falling back to SQLite.');
    }
  }

  // 💾 SQLite fallback (for local/dev)
  const sqlitePath = process.env.SQLITE_PATH || './data/estate.sqlite';
  console.log('💾 Using SQLite at', path.resolve(process.cwd(), sqlitePath));

  return {
    type: 'sqlite',
    database: path.resolve(process.cwd(), sqlitePath),
    autoLoadEntities: true,
    synchronize: process.env.SQLITE_SYNC === 'true',
    logging: true,
  };
};

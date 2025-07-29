// data-source.ts
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import configuration from './src/config/configuration';

const config = configuration();
const dbConfig = config.postgres;
const nodeEnv = config.node.env;

const options: DataSourceOptions = {
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,

  synchronize: false,

  logging: nodeEnv !== 'production' ? 'all' : ['error'],

  entities: ['src/**/*.schema.ts'],

  migrations: ['src/migrations/*.ts'],

  migrationsTableName: 'typeorm_migrations',
};

export const AppDataSource = new DataSource(options);

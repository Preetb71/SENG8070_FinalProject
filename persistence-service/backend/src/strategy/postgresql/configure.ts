import { DataSource } from "typeorm";
import { Photo } from "./photo/photo";
import dotenv from 'dotenv';
dotenv.config();


export const postgresDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Photo],
  synchronize: true,
  logging: false,
});

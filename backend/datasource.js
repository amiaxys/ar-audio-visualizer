import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(process.env.POSTGRES_DB_NAME, process.env.POSTGRES_DB_USER, process.env.POSTGRES_DB_PASSWORD, {
  dialect: "postgres",
  host: process.env.POSTGRES_DB_HOST,
});

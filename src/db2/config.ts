import dotenv from "dotenv"
dotenv.config({ path: ".env.api" })

import { Dialect, Sequelize } from "sequelize"

export const dbName = process.env.DB_NAME as string
export const dbUser = process.env.DB_USER as string
export const dbHost = process.env.DB_HOST
export const dbPassword = process.env.DB_PASSWORD
const dbDriver = process.env.DB_DRIVER as Dialect
const dbDriverFb = "mssql" as Dialect

const sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDriver || dbDriverFb
})

export default sequelizeConnection

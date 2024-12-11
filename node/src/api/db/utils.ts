import { Sequelize } from "sequelize"
// import { Sequelize } from '@sequelize/core';
// import { MsSqlDialect } from '@sequelize/mssql';
import dotenv from "dotenv"
// import { application } from "express"

dotenv.config({ path: ".env.api" })
export const db1Name = process.env.DB2_NAME as string
export const db1User = process.env.DB2_USER as string
export const db1Host = process.env.DB2_HOST
export const db1Password = process.env.DB2_PASSWORD
export const db2Name = process.env.DB3_NAME as string
export const db2User = process.env.DB3_USER as string
export const db2Host = process.env.DB3_HOST
export const db2Password = process.env.DB3_PASSWORD
export const db4Name = process.env.DB4_NAME as string
export const db4User = process.env.DB4_USER as string
export const db4Host = process.env.DB4_HOST
export const db4Password = process.env.DB4_PASSWORD
export const db5Name = process.env.DB5_NAME as string
export const db5User = process.env.DB5_USER as string
export const db5Host = process.env.DB5_HOST
export const db5Password = process.env.DB5_PASSWORD
export const db5Domain = process.env.DB5_DOMAIN

export const sequelize = (dbName, dbUser, dbPassword, dbHost) =>
  new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: 1433,
    dialect: "mssql",
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 25000
    },
    dialectOptions: {
      options: { encrypt: false, requestTimeout: 1000000 }
    },
    logging: process.env.NODE_ENV === "development"
  })

const sequelizeProd = () =>
  new Sequelize({
    host: db5Host,
    dialect: "mssql",
    dialectOptions: {
      authentication: {
        readOnlyIntent: true,
        type: "ntlm",
        options: {
          domain: db5Domain,
          userName: db5User,
          password: db5Password
        }
      },
      options: {
        readOnlyIntent: true,
        encrypt: false,
        database: db5Name
        // instanceName: "SQLEXPRESS"
      }
    },
    logging: process.env.NODE_ENV === "development"
  })

export const connection1 = sequelize(db1Name, db1User, db1Password, db1Host)
export const connection2 = sequelize(db2Name, db2User, db2Password, db2Host)
export const connection3 = sequelizeProd()
export const connection4 = sequelize(db4Name, db4User, db4Password, db4Host)

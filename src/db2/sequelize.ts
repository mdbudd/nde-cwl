import sequelizeConnection, {
  dbUser,
  dbHost,
  dbName,
  dbPassword
} from "./config" //path to the above config.js file

export const sequelize = sequelizeConnection
import mysql from "mysql2/promise"

// Test the connection
export async function testConnection() {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    console.log("Sequelize connected successfully")
  } catch (error) {
    //ensure you created the database
    //check database credentials
    console.error("Unable to connect to the database:", error)
  }
}

export async function createDatabase() {
  mysql
    .createConnection({
      user: dbUser,
      password: dbPassword,
      host: dbHost
    })
    .then((connection) => {
      connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`).then(() => {
        // Safe to use sequelize now
        console.log("Database created successfully")
        testConnection()
      })
    })
}

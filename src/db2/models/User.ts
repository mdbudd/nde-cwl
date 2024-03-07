import { sequelize } from "../sequelize"
import { DataTypes } from "sequelize"
// Define a model
export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
})
// Synchronize the model with the database
// This function will delete all existing tables in the database
export const syncDatabase = async () => {
  await sequelize.sync()
  console.log("Database synchronized.")
}
// remember to comment this after server runs ones.
// syncDatabase();

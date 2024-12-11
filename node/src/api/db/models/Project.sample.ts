import { DataTypes, Model } from "sequelize"
import { connection1 } from "../utils"

export class Project extends Model {}

Project.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    Title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    CurrentCost: {
      type: DataTypes.DECIMAL
      // allowNull defaults to true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    LastModifiedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    LastModifiedBy: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize: connection1,
    modelName: "Project",
    timestamps: false
  }
)

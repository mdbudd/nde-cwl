import { DataTypes, Model } from "sequelize"
import { connection1 } from "../utils"

export class EntityType extends Model {}

EntityType.init(
  {
    // Model attributes are defined here
    // ID: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
    Description: {
      type: DataTypes.STRING
      // allowNull defaults to true
    }
  },
  {
    // Other model options go here
    sequelize: connection1, // We need to pass the connection instance
    modelName: "EntityType", // We need to choose the model name
    timestamps: false
  }
)

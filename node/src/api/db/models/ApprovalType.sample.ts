import { DataTypes, Model } from "sequelize"
import { connection1 } from "../utils"

export class ApprovalType extends Model {}

ApprovalType.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Description: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    },
    Code: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    },
    SortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  },
  {
    sequelize: connection1,
    modelName: "ApprovalType",
    timestamps: false
  }
)

import { DataTypes, Model } from "sequelize"
import { connection1 } from "../utils"

export class Approval extends Model {}

Approval.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    EntityTypeID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    EntityIdentifier: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    },
    ApprovalTypeID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CreatedDate: {
      type: DataTypes.NOW,
      allowNull: false
    },
    CreatedBy: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    },
    LastModifiedDate: {
      type: DataTypes.NOW,
      allowNull: false
    },
    LastModifiedBy: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    }
  },
  {
    sequelize: connection1,
    modelName: "Approval",
    timestamps: false
  }
)

import { DataTypes, Model } from "sequelize"
import { connection1 } from "../utils"

export class Publication extends Model {}

Publication.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    Title: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    },
    ShortTitle: {
      type: DataTypes.STRING("MAX")
    },
    Identifier: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    },
    Authors: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    },
    PublicationDate: {
      type: DataTypes.DATE
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    CreatedBy: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    },
    LastModifiedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    LastModifiedBy: {
      type: DataTypes.STRING("MAX"),
      allowNull: false
    }
  },
  {
    sequelize: connection1,
    modelName: "Publication",
    timestamps: false
  }
)

import { DataTypes, Model } from "sequelize"
import { connection2 } from "../utils"

export class Warehouse extends Model {}

Warehouse.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    SystemID: {
      type: DataTypes.INTEGER
    },
    WID: {
      type: DataTypes.STRING(50)
    },
    Priority: {
      type: DataTypes.STRING("MAX")
    },
    TopicNumber: {
      type: DataTypes.INTEGER
    },
    WorkStream: {
      type: DataTypes.STRING("MAX")
    },
    Type: {
      type: DataTypes.STRING("MAX")
    },
    Status: {
      type: DataTypes.STRING(50)
    },
    Title: {
      type: DataTypes.STRING("MAX")
    },
    Sensitivity: {
      type: DataTypes.STRING("MAX")
    },
    BaselineCost: {
      type: DataTypes.FLOAT
    },
    CurrentCost: {
      type: DataTypes.FLOAT
    },
    AdditionalCost: {
      type: DataTypes.FLOAT
    },
    GeoLocation: {
      type: DataTypes.GEOGRAPHY
    },
    ShortTitle: {
      type: DataTypes.STRING("MAX") //nvarchar
    },
    AtRiskScore: {
      type: DataTypes.INTEGER
    },
  },
  {
    sequelize: connection2,
    modelName: "Warehouse",
    timestamps: false
  }
)

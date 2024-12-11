import express, { Request, Response } from "express"
import fs from "fs"
import path from "path"
import { QueryTypes } from "sequelize"
import {
  // sequelize,
  connection1
  // connection2,
  // connection3,
  // connection4
} from "./utils"
import {
  EntityType,
  Project,
  Warehouse,
  Publication,
  Approval,
  ApprovalType
  // ResearchDocument
} from "./models/index.sample"

const router = express.Router()

let defaultPublication = "10.3310%2FBHQZ7691"
let defaultIdentifier = "05%2F12%2F01"
// let defaultOutputIdentifier = "06%2F301%2F233"

router.get("/", async (req: Request, res: Response) => {
  let message = "Connection has been established successfully."
  try {
    await connection1.authenticate()
    console.log(message)
    res.json({
      status: true,
      message: "Connection has been established successfully."
    })
  } catch (error) {
    message = "Unable to connect to the database."
    console.error(`${message}..`, error)
    res.json({
      status: false,
      message,
      error
    })
  }
})
router.get("/aw", async (req: Request, res: Response) => {
  // This uses the Raw Query to query for all dbs for example
  connection1
    .query(
      // "SELECT TOP(100) * FROM vw_AllProjects",
      "SELECT TOP(100) * FROM dbo.Aw",
      { type: QueryTypes.SELECT }
    )
    .then(async (dbs) => {
      // console.log("dbs", dbs)
      res.send(dbs)
    })
    .catch((err) => res.send(err))
})

router.get("/entity-types", async (req: Request, res: Response) => {
  const entityType104 = await EntityType.findOne({ where: { id: 104 } })
  const allEntityTypes = await EntityType.findAll()
  res.send({ allEntityTypes, entityType104 })
})

router.get("/all-projects/:id?", async (req: Request, res: Response) => {
  const { id } = req.params // remember to encode
  // const firstProject = await Project.findOne()
  let projectById = await Project.findOne({
    where: {
      Id: id || decodeURIComponent(defaultIdentifier)
    }
  })
  const warehouseById = await Warehouse.findOne({
    where: {
      WID: id || decodeURIComponent(defaultIdentifier)
    }
  })
  if (projectById !== null && warehouseById !== null) {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    projectById.dataValues["Id"] = warehouseById["WID"]
  }

  const projectCount = await Project.count()
  res.send({ projectCount, projectById })
})

router.get("/warehouse/:id?", async (req: Request, res: Response) => {
  const { id } = req.params // remember to encode
  // const firstWarehouse = await Warehouse.findOne()
  const warehouseById = await Warehouse.findOne({
    where: {
      WID: id || decodeURIComponent(defaultIdentifier)
    }
  })
  const warehouseCount = await Warehouse.count()
  res.send({ warehouseCount, warehouseById })
})

router.get("/publications/:id?", async (req: Request, res: Response) => {
  const { id } = req.params // remember to encode
  // const firstResearchPublication = await ResearchPublication.findOne()
  const publicationById = await Publication.findOne({
    where: {
      Identifier: id || decodeURIComponent(defaultPublication)
    }
  })
  const publicationCount = await Publication.count()
  res.send({ publicationCount, publicationById })
})
router.get("/test-end", async (req: Request, res: Response) => {
  const approvalsHead = await Approval.findAll({
    limit: 10
  })
  const approvalTypesHead = await ApprovalType.findAll({
    limit: 10
  })
  res.send({ approvalsHead, approvalTypesHead })
})

/**
 *  @swagger
 *  {
 *    "/api/v1/db/base-data": {
 *      "get": {
 *        "summary": "Get base data for aw. For testing current output of SP. Not recommended in swagger due to volume of data returned.",
 *        "tags": ["Data"],
 *        "responses": {
 *          "200": {
 *            "description": "json representation of the base data",
 *            "content": {
 *              "application/json": {
 *                "schema": {
 *                  "type": "array",
 *
 *                }
 *              },
 *              "text/html": {},
 *              "application/xml": { }
 *            }
 *          }
 *        }
 *      }
 *    }
 *  }
 */
router.get("/base-data", async (req: Request, res: Response) => {
  // connection3
  //   .authenticate()
  //   .then(function (err) {
  //     console.log("Connection has been established successfully.")
  //     res.send({ message: "Connection has been established successfully." })
  //   })
  //   .catch(function (err) {
  //     console.log("Unable to connect to the database:", err)
  //   })

  // connection1
  //   .getQueryInterface()
  //   .showAllSchemas()
  //   .then((tableObj) => {
  //     console.log("// Tables in database", "==========================")
  //     console.log(tableObj)
  //   })
  //   .catch((err) => {
  //     console.log("showAllSchemas ERROR", err)
  //   })

  // const documentHead = await document.findAll({
  //   limit: 10
  // })

  // const allTables = await connection3.getQueryInterface().showAllTables()
  // console.log(allTables)

  const fileName1 = "./sql/AwBase.sample.sql"
  const file1 = path.resolve(__dirname, fileName1)
  var sqlString1 = fs.readFileSync(file1, "utf8")
  const awBase = await connection1.query(sqlString1)

  const fileName2 = "./sql/infoData.sample.sql"
  const file2 = path.resolve(__dirname, fileName2)
  var sqlString2 = fs.readFileSync(file2, "utf8")
  const infoData = await connection1.query(sqlString2)

  const fileName3 = "./sql/WarehouseData.sample.sql"
  const file3 = path.resolve(__dirname, fileName3)
  var sqlString3 = fs.readFileSync(file3, "utf8")
  const warehouseData = await connection1.query(sqlString3)

  res.send({
    awBase,
    infoData,
    warehouseData
  })
})

/**
 *  @swagger
 *  {
 *    "/api/v1/db/final-outputs": {
 *      "get": {
 *        "summary": "Get final outputs of awards. For testing current output of SP. Not recommended in swagger due to volume of data returned.",
 *        "tags": ["Data"],
 *        "responses": {
 *          "200": {
 *            "description": "json representation of the base data",
 *            "content": {
 *              "application/json": {
 *                "schema": {
 *                  "type": "array",
 *
 *                }
 *              },
 *              "text/html": {},
 *              "application/xml": { }
 *            }
 *          }
 *        }
 *      }
 *    }
 *  }
 */
router.get("/final-outputs", async (req: Request, res: Response) => {
  const fileName = "./sql/FinalOutputs.sample.sql"
  const file = path.resolve(__dirname, fileName)
  var sqlString = fs.readFileSync(file, "utf8")
  const finalOutputs = await connection1.query(sqlString)
  res.send({
    finalOutputs
  })
})

/**
 *  @swagger
 *  {
 *    "/api/v1/db/outputs/{id}": {
 *      "get": {
 *        "summary": "Get outputs. Optional id. For testing current output of SP. Not recommended in swagger unless with id value.",
 *        "tags": ["Data"],
 *        "parameters": [
 *          {
 *            "in": "path",
 *            "name": "id",
 *            "default":"06/301/233",
 *            "required": false,
 *            "allowEmptyValue":true,
 *            "schema": {
 *              "type": "string"
 *            },
 *            "description": "Optional id."
 *          }
 *        ],
 *        "responses": {
 *          "200": {
 *            "description": "json representation of the base data",
 *            "content": {
 *              "application/json": {
 *                "schema": {
 *                  "type": "array",
 *
 *                }
 *              },
 *              "text/html": {},
 *              "application/xml": { }
 *            }
 *          }
 *        }
 *      }
 *    }
 *  }
 */
router.get("/outputs/:id?", async (req: Request, res: Response) => {
  const { id } = req.params // remember to encode
  const fileName = "./sql/Outputs.sample.sql"
  const file = path.resolve(__dirname, fileName)
  let sqlString = fs.readFileSync(file, "utf8")
  sqlString = `${sqlString}`
  let outputs = await connection1.query(sqlString).catch(function (err) {
    return err
  })
  outputs = id
    ? outputs[0].filter((output) => output.Identifier == decodeURIComponent(id))
    : outputs
  res.send({
    outputs
  })
})

/**
 *  @swagger
 *  {
 *    "/api/v1/db/links": {
 *      "get": {
 *        "summary": "Get all links associated with aw. For testing current output of SP.",
 *        "tags": ["Data"],
 *        "responses": {
 *          "200": {
 *            "description": "json representation of the base data",
 *            "content": {
 *              "application/json": {
 *                "schema": {
 *                  "type": "array",
 *
 *                }
 *              },
 *              "text/html": {},
 *              "application/xml": { }
 *            }
 *          }
 *        }
 *      }
 *    }
 *  }
 */
router.get("/links", async (req: Request, res: Response) => {
  const { id } = req.params // remember to encode
  const fileName1 = "./sql/Dps.sample.sql"
  const file1 = path.resolve(__dirname, fileName1)
  let sqlString1 = fs.readFileSync(file1, "utf8")
  sqlString1 = `${sqlString1}`
  let damps = await connection1.query(sqlString1).catch(function (err) {
    return err
  })
  const fileName2 = "./sql/Links.sample.sql"
  const file2 = path.resolve(__dirname, fileName2)
  let sqlString2 = fs.readFileSync(file2, "utf8")
  sqlString2 = `${sqlString2}`
  let research = await connection1.query(sqlString2).catch(function (err) {
    return err
  })
  damps = id
    ? damps[0].filter((damp) => damp.Identifier == decodeURIComponent(id))
    : damps
  res.send({
    damps,
    research
  })
})

/**
 *  @swagger
 *  {
 *    "/api/v1/db/roles": {
 *      "get": {
 *        "summary": "Get all roles associated with aws. For testing current output of SP. Not recommended in swagger due to volume of data returned.",
 *        "tags": ["Data"],
 *        "responses": {
 *          "200": {
 *            "description": "json representation of the base data",
 *            "content": {
 *              "application/json": {
 *                "schema": {
 *                  "type": "array",
 *
 *                }
 *              },
 *              "text/html": {},
 *              "application/xml": { }
 *            }
 *          }
 *        }
 *      }
 *    }
 *  }
 */
router.get("/roles", async (req: Request, res: Response) => {
  const fileName = "./sql/Roles.sample.sql"
  const file = path.resolve(__dirname, fileName)
  var sqlString = fs.readFileSync(file, "utf8")
  const roles = await connection1.query(sqlString)
  res.send({
    roles
  })
})

export default router

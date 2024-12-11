import { Request, Response } from "express"
import { XMLParser, XMLBuilder } from "fast-xml-parser"
import fs from "fs"
import path from "path"

const xmlPath = path.resolve("..", "data", "xml")

const jsonPath = path.resolve("..", "data", "json")

export const createXml = async (request: Request, response: Response) => {
  const parser = new XMLParser({
    ignoreAttributes: false
  })
  const startXml = await fs.promises.readFile(`${xmlPath}/xmlStart.xml`, "utf8")
  let SKJson = parser.parse(startXml)
  await fs.promises.writeFile(
    `${jsonPath}/jsonStart.json`,
    JSON.stringify(SKJson, null, 4)
  )
  delete SKJson.Publication.Documents
  await fs.promises.writeFile(
    `${jsonPath}/jsonFinish.json`,
    JSON.stringify(SKJson, null, 4)
  )
  const builder = new XMLBuilder({ format: true, ignoreAttributes: false })
  const SKXml = builder.build(SKJson)
  await fs.promises.writeFile(`${xmlPath}/xmlFinish.xml`, SKXml)
  response.status(200).send(SKXml)
}

const generateSeqModelCols = (data) => {
  let obj = {}
  data.map((colItem, i) => {
    let colData = colItem
    let type = colData["@_DbType"]
    type = type.split(" ")[0]
    if (type === "Int") type = "DataTypes.INTEGER".replace(/^"(.*)"$/, "$1")
    if (type === "NVarChar(MAX)") type = 'DataTypes.STRING("MAX")'
    if (type === "NVarChar(255)") type = "DataTypes.STRING(255)"
    if (type === "DateTime") type = "DataTypes.NOW"
    if (type === "Bit") type = "DataTypes.BOOLEAN"
    if (type === "Float") type = "DataTypes.FLOAT"
    if (type === "Money") type = "DataTypes.DECIMAL(19,4)"
    if (type === "UniqueIdentifier") type = "DataTypes.UUID"
    if (type === "Date") type = "DataTypes.DATE"

    let contents = { type }
    if (colData["@_CanBeNull"] === "false") contents["allowNull"] = false
    if (colData["@_IsPrimaryKey"] && colData["@_IsPrimaryKey"] === "true")
      contents["primaryKey"] = true
    obj[colData["@_Name"]] = contents
  })
  return obj
}
const generateEfModelCols = (data) => {
  let arr = []
  data.map((colItem, i) => {
    let colData = colItem
    let type = colData["@_DbType"]
    type = type.split(" ")[0]
    if (type === "Int") type = "int".replace(/^"(.*)"$/, "$1")
    if (type === "NVarChar(MAX)") type = "string"
    if (type === "NVarChar(255)") type = "string"
    if (type === "DateTime") type = "DateTime"
    if (type === "Bit") type = "bool"
    if (type === "Float") type = "double"
    if (type === "Money") type = "decimal"
    if (type === "UniqueIdentifier") type = "Guid"
    if (type === "Date") type = "DateTime"

    let contents = ""
    if (colData["@_IsPrimaryKey"] && colData["@_IsPrimaryKey"] === "true")
      contents = "[Key]"
    contents = `${contents}public ${type}`
    if (colData["@_CanBeNull"] === "false") contents = `${contents}?`
    contents = `${contents} ${colData["@_Name"]}`
    contents = `${contents} { get; set; }`
    arr.push(contents)
  })
  return arr
}

export const createJlSequelizeModel = async (
  request: Request,
  response: Response
) => {
  const parser = new XMLParser({
    ignoreAttributes: false
  })
  const startXml = await fs.promises.readFile(
    `${xmlPath}/xmlModels.xml`,
    "utf8"
  )
  let JLJson = parser.parse(startXml)
  let tables = JLJson.Database.Table
  let models = tables.map((item) => {
    let columns = generateSeqModelCols(item.Type.Column)
    return {
      [`${item.Type["@_Name"]}.init`]: columns
    }
  })
  // response.status(200).send(tables)
  response.status(200).send(models)
}

export const createJlEfModel = async (request: Request, response: Response) => {
  const parser = new XMLParser({
    ignoreAttributes: false
  })
  const startXml = await fs.promises.readFile(
    `${xmlPath}/xmlModels.xml`,
    "utf8"
  )
  let JLJson = parser.parse(startXml)
  let tables = JLJson.Database.Table
  let models = tables.map((item) => {
    let columns = generateEfModelCols(item.Type.Column)
    return {
      [item.Type["@_Name"]]: columns
    }
  })
  // response.status(200).send(tables)
  response.status(200).send(models)
}

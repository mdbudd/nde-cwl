import express, { Request, Response } from "express"
import { createXml, createJlSequelizeModel, createJlEfModel } from "./utils"

const router = express.Router()

router.get("/create", function (req: Request, res: Response) {
  let users = [{ name: "jim" }, { name: "james" }]
  res.type("application/xml")
  res.format({
    xml: createXml,
    text: function () {
      res.send(
        users
          .map(function (user) {
            return " - " + user.name + "\\n"
          })
          .join("")
      )
    },
    json: function () {
      res.json(users)
    }
  })
})

router.get("/jl-seq-models", function (req: Request, res: Response) {
  res.type("application/json")
  res.format({
    json: createJlSequelizeModel
  })
})
router.get("/jl-ef-models", function (req: Request, res: Response) {
  res.type("application/json")
  res.format({
    json: createJlEfModel
  })
})

export default router

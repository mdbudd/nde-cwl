import express, { Request, Response } from "express"
import { items } from "../items"
import { config, q1, Connection, Request as dbRequest } from "../db"

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
  res.json({ status: true, message: "Our node.js app works" })
})

router.get("/items", (req: Request, res: Response) => {
  res.json({ status: true, message: "Fetched all items", data: items })
})

router.get("/db-items", async (req: Request, res: Response) => {
  let ansf = []

  const connection = new Connection(config)

  let queryItems = (q) => {
    const request = new dbRequest(q, function (err, rowCount) {
      if (err) {
        console.log(err)
      } else {
        console.log(rowCount + " rows pulled")
        res.send({ ansf })
        connection.close()
      }
    })

    request.on("row", function (columns) {
      let ans = {}
      columns.forEach(function (column) {
        ans[column.metadata.colName] = column.value
        if (Object.keys(ans).length === 41) {
          // I know each row is 41 cols long
          ansf.push(ans)
          ans = {}
        }
      })
      // console.log('ansf length: ' + ansf.length);
      // res.send({ ansf });          // This is the response I would like to return
    })

    request.on("done", function (rowCount) {
      console.log(rowCount + " rows returned")
      connection.close()
    })

    connection.execSql(request)
  }

  connection.connect((err) => {
    if (err) {
      console.log("Connection Failed")
      throw err
    }
    console.log("Connected!")
    queryItems(q1)
  })
})

export default router

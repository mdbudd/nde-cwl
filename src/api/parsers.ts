import express, { Request, Response } from "express"
// import parser from "lucene-query-parser"
import { parse /*, serialize*/ } from "liqe"

const router = express.Router()
/**
 * @swagger
 * components:
 *   schemas:
 *     Lucene:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - finished
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The title of your book
 *         author:
 *           type: string
 *           description: The book author
 *         finished:
 *           type: boolean
 *           description: Whether you have finished reading the book
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the book was added
 *       example:
 *         id: d5fE_asz
 *         title: The New Turing Omnibus
 *         author: Alexander K. Dewdney
 *         finished: false
 *         createdAt: 2020-03-10T04:05:06.157Z
 */

/**
 *  @swagger
 *  {
 *    "tags": {
 *      "name": "Parsers",
 *      "description": "services to parse input into various formats, usually json"
 *    },
 *    "/api/v1/parse/lucene?search={query}": {
 *      "get": {
 *        "summary": "json representation of lucene url query",
 *        "tags": ["Parsers"],
 *        "parameters": [
 *          {
 *            "in": "path",
 *            "name": "query",
 *            "required": true,
 *            "schema": {
 *              "type": "string",
 *              "minimum": 1
 *            },
 *            "description": "The lucene query"
 *          }
 *        ],
 *        "responses": {
 *          "200": {
 *            "description": "json representation of lucene url query",
 *            "content": {
 *              "application/json": {
 *                "schema": {
 *                  "type": "array",
 *                  "items": {
 *                    "$ref": "#/components/schemas/Lucene"
 *                  }
 *                }
 *              }
 *            }
 *          }
 *        }
 *      }
 *    }
 *  }
 */

router.get("/lucene", (req: Request, res: Response) => {
  let query = req.query

  var { w, x, ...remaining } = { w: 1, x: 2, y: 3, z: 4 }
  console.log(w, x, remaining) // 1, 2, {y:3,z:4}

  var [x, y, ...rest] = [1, 2, 3, 4]
  console.log(x, y, rest) // 1, 2, [3,4]

  let a, b, remainder
  ;[a, b] = [10, 20]

  console.log(a)
  // Expected output: 10

  console.log(b)
  // Expected output: 20
  ;[a, b, ...remainder] = [10, 20, 30, 40, 50]

  console.log(remainder)
  // Expected output: Array [30, 40, 50]

  console.info(query)
  // var wontWork = parse('doe AND 1212 AND !foo OR (!(am*ya AND 12) blah) OR baz');
  // var willWork= parse('name:foo AND NOT (bio:bar OR bio:baz)')
  res.format({
    html: function () {
      res.send("<p>Json only at present, please run appropriate request!</p>")
    },
    text: function () {
      res.send("Json only at present, please run appropriate request!")
    },
    json: function () {
      res.json({ status: parse(query.search.toString()) })
    },
  })
})

router.get("/names", function (req: Request, res: Response) {
  let users = [{ name: "jim" }, { name: "james" }]
  res.format({
    html: function () {
      res.send(
        "<ul>" +
          users
            .map(function (user) {
              return "<li>" + user.name + "</li>"
            })
            .join("") +
          "</ul>",
      )
    },
    text: function () {
      res.send(
        users
          .map(function (user) {
            return " - " + user.name + "\\n"
          })
          .join(""),
      )
    },
    json: function () {
      res.json(users)
    },
  })
})

// router.get("/liqe", (req: Request, res: Response) => {
//   let query = req.query
//   console.info(query)
//   // var results = parse('foo:bar');
//   res.json({ status: parse(query.search.toString() || "") })
// })

export default router

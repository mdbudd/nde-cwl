import express from "express"
import MessageResponse from "../interfaces/MessageResponse"
import emojis from "./emojis"
import parsers from "./parsers"
import db from "./db/index.sample"
import crawler from "./crawler"

const router = express.Router()
// console.log(process.memoryUsage())
router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  })
})
router.get<{}, MessageResponse>("/hello", (req, res) => {
  res.json({
    message: "Is it API you're looking for... 👋🌎🌍🌏",
  })
})

router.use("/emojis", emojis)
router.use("/parse", parsers)
/* The line `// router.use('/db', db);` is a commented-out line of code in the TypeScript file. It appears to be a route declaration that is currently disabled by
commenting it out using `//`. This means that this particular route is not active and will not be used in the application. */
router.use("/db", db)
router.use("/crawler", crawler)

export default router

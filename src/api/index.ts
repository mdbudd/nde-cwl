import express from "express"
import MessageResponse from "../interfaces/MessageResponse"
import emojis from "./emojis"
import parsers from "./parsers"
// import db from './db';
import db2 from "./db2"
import crawler from "./crawler"

const router = express.Router()
console.log(process.memoryUsage())
router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏"
  })
})
router.get<{}, MessageResponse>("/hello", (req, res) => {
  res.json({
    message: "Is it API you're looking for... 👋🌎🌍🌏"
  })
})

router.use("/emojis", emojis)
router.use("/parse", parsers)
// router.use('/db', db);
router.use("/db2", db2)
router.use("/crawler", crawler)

export default router

import express from "express"
import MessageResponse from "../interfaces/MessageResponse"
import emojis from "./emojis"
import parsers from "./parsers"
// import db from './db';
import crawler from "./crawler"

const router = express.Router()

router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  })
})

router.use("/emojis", emojis)
router.use("/parse", parsers)
// router.use('/db', db);
router.use("/crawler", crawler)

export default router

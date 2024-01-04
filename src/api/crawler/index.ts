import express, { Request, Response } from "express"
// import { crawlee } from "./crawlee"
import { Worker } from "worker_threads"
const router = express.Router()

router.get("/crawl", (req: Request, res: Response) => {
  // crawlee()
  const worker = new Worker("./api/crawler/worker.js", {
    workerData: {
      path: "./crawleer.ts",
    },
  })

  worker.once("message", (result) => {
    console.log(result || "Worker at the coal face!")
  })

  worker.on("error", (error) => {
    console.log(error)
  })

  worker.on("exit", (exitCode) => {
    res.json({
      status: true,
      exitCode,
      message: "Biggest crawler has finished",
    })
  })
})

export default router

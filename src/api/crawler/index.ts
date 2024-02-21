import express, { Request, Response } from "express"
import { swap } from "./solr"
import { getCategories, getImageData } from "./utils/helpers"
import { Worker } from "worker_threads"
const router = express.Router()

router.get("/crawl", (req: Request, res: Response) => {
  // crawlee()
  const worker = new Worker("./src/api/crawler/worker.js", {
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
      message: `${process.env.ORG || ""}'s biggest crawler has finished`,
    })
  })
})

router.get("/swap", (req: Request, res: Response) => {
  swap()
  res.json({
    status: true,
    exitCode: 0,
    message: "Collections Swapped!",
  })
})

router.get("/cats", (req: Request, res: Response) => {
  console.log("getting cats!")
  let dataDir = process.env.DATA_DIR || "/"
  const crawlDir = `${dataDir}/crawleer`
  let json = getCategories(
    `${__dirname}/website_category_listing.xlsx`,
    crawlDir,
  )

  res.json({
    status: true,
    exitCode: 0,
    message: "Sheet data created!",
    data: json,
  })
})

router.get("/img", async (req: Request, res: Response) => {
  // let dataDir = process.env.DATA_DIR || "/"

  let img = await getImageData("https://raw.githubusercontent.com/ianare/exif-samples/master/jpg/long_description.jpg", null)

  res.json({
    status: true,
    exitCode: 0,
    message: "img read!",
    data: img,
  })
})

export default router

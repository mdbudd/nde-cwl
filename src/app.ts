import express, { Application, Request, Response } from "express"
import morgan from "morgan"
import helmet from "helmet"
import cors from "cors"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

import * as middlewares from "./middlewares"
import api from "./api"
import MessageResponse from "./interfaces/MessageResponse"

import optionsJson from "./options.json"

const dotenv = require("dotenv")
dotenv.config({ path: ".env.sample" })
dotenv.config({ path: ".env.api" })

const app: Application = express()
const setRateLimit = require("express-rate-limit");

// Rate limit middleware
const rateLimitMiddleware = setRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "You have exceeded your 100 requests per 5 minute limit.",
  headers: true,
});
app.use(rateLimitMiddleware)
app.use(morgan("dev"))
app.use(helmet())
app.use(cors())
app.use(express.json())

const specs = swaggerJsdoc(optionsJson)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    // customCssUrl: "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
  }),
)
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json")
  res.send(specs)
})
app.get("/random", (req: Request, res: Response) => {
  res.json({ message: "Hello World!" })
})

app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  })
})

app.use("/api/v1", api)
app.use(middlewares.notFound)
app.use(middlewares.errorHandler)

export default app

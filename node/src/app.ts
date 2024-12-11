import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
// prefer to leave express open for new endpoints so leaving startStandaloneServer for awareness
// import { startStandaloneServer } from "@apollo/server/standalone"
import express, { Express, Request, Response } from "express"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { WebSocketServer } from "ws"
import { useServer } from "graphql-ws/lib/use/ws"
import morgan from "morgan"
// import helmet from "helmet"
import http from "http"
import cors from "cors"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import session from "express-session"

import * as middlewares from "./resources/middlewares"
import api from "./api"
import MessageResponse from "./interfaces/MessageResponse"

import { PlacesAPI, WeatherAPI } from "./resources/rest"
import { resolvers } from "./resources/resolvers"
import { typeDefs } from "./resources/typedefs"
import { verifyAccessToken } from "./resources/utils"
import optionsJson from "./options.json"

const dotenv = require("dotenv")
dotenv.config({ path: ".env.global" })
dotenv.config({ path: ".env.api" })

type XmlRef = {
  path: string
}

declare module "express-session" {
  interface SessionData {
    xmlRef: XmlRef
  }
}

console.log(process.env.NODE_ENV)

// eslint-disable-next-line @typescript-eslint/dot-notation
optionsJson.definition.servers[0].url =
  process.env.NODE_ENV == "development"
    ? "http://localhost:8081"
    : process.env.PROD_HOST
const specs = swaggerJsdoc(optionsJson)

const app: Express = express()
const httpServer = http.createServer(app)
const setRateLimit = require("express-rate-limit")

// Rate limit middleware
const rateLimitMiddleware = setRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "You have exceeded your 100 requests per 5 minute limit.",
  headers: true
})



const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  // path: "/graphql",
})

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer({ schema }, wsServer)

// Set up Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer: httpServer }),
    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

// envoking server asyncronously in order to instantiate Apollo Server
async function main(): Promise<void> {
  await server.start()
  app.use(
    session({ secret: "mySecretKey", resave: false, saveUninitialized: false })
  )
  app.use(cors({ credentials: true, origin: true }))
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true
      // customCssUrl: "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
    })
  )
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(specs)
  })
  app.use(rateLimitMiddleware)
  app.use(morgan("dev"))
  // app.use(helmet())
  app.use(express.json())

  app.use(
    "/graphql",
    cors({
      // origin: whitelist,
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req /*, res*/ }) => {
        const { cache } = server
        const tokenIn = req.headers.authorization || ""
        const token = tokenIn.replace("token=", "")
        let user = { token, name: "", roles: [""] }
        var decoded: any = verifyAccessToken(token)
        if (decoded.success) {
          user = { token, name: decoded.data.name, roles: decoded.data.roles }
        } else {
          user = user
        }
        return {
          dataSources: {
            placesAPI: new PlacesAPI({ cache }),
            weatherAPI: new WeatherAPI({ cache }),
          },
          user,
        }
      },
    }),
  )


  app.get("/random", (req: Request, res: Response) => {
    res.json({ message: "Hello World!" })
  })

  app.get<{}, MessageResponse>("/", (req, res) => {
    res.json({
      message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄"
    })
  })

  app.use("/api/v1", api)
  app.use(middlewares.notFound)
  app.use(middlewares.errorHandler)
  const port = process.env.NODE_ENV === "development" ? 8081 : 2096
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
  httpServer.listen({ port }, () =>
    console.log(
      `🚀 ${protocol} Server ready at ${protocol}://localhost:${port}`
    )
  )
  // httpsServer.listen({ port: 2096 }, () =>
  //   console.log("🚀 https Server ready at https://localhost:2096"),
  // )
}
main().catch(console.error)

export default app // exporting app for testing

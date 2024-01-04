import request from "supertest"
import app from "../app"

describe("GET /api/v1", () => {
  it("responds with a json message", done => {
    request(app).get("/api/v1").set("Accept", "application/json").expect("Content-Type", /json/).expect(
      200,
      {
        message: "API - 👋🌎🌍🌏",
      },
      done,
    )
  })
})

describe("GET /api/v1/emojis", () => {
  it("responds with a json message", done => {
    request(app).get("/api/v1/emojis").set("Accept", "application/json").expect("Content-Type", /json/).expect(200, ["🏴‍☠️", "🦜", "⛵"], done)
  })
})

describe("GET /api/v1/parse/lucene?search=bob", () => {
  it("responds with a json message", done => {
    request(app)
      .get("/api/v1/parse/lucene?search=bob")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(
        200,
        {
          status: {
            location: { start: 0, end: 3 },
            field: { type: "ImplicitField" },
            type: "Tag",
            expression: { location: { start: 0, end: 3 }, type: "LiteralExpression", quoted: false, value: "bob" },
          },
        },
        done,
      )
  })
})

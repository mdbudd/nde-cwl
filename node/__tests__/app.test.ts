import request from "supertest"
import app from "../src/app"

describe("Test app.ts", () => {
  test("Catch-all route", async () => {
    const res = await request(app).get("/random")
    expect(res.body.message).toEqual("Hello World!")
  })
})

describe("app", () => {
  it("responds with a not found message", (done) => {
    request(app)
      .get("/what-is-this-even")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(404, done)
  })
})

describe("GET /", () => {
  it("responds with a json message", (done) => {
    request(app)
      .get("/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(
        200,
        {
          message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄"
        },
        done
      )
  })
})

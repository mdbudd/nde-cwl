import fs from "fs"

export const typeDefs = `
  ${fs.readFileSync(__dirname.concat("/schema.graphql"), "utf8")}
`
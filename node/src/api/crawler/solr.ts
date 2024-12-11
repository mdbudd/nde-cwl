const solr = require("../../lib/solr")
require("dotenv").config()

export const client = solr.createClient()
// client.basicAuth('solr','SolrRocks');
export const swap = async () => {
  await client.swapCols(function (err /*, response*/) {
    if (err) throw err
    console.log("collections swapped")
    client.commit()
  })
}

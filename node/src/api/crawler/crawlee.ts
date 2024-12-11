import { Dataset, PlaywrightCrawler, playwrightUtils } from "crawlee"
import { parentPort } from "worker_threads"
import sites from "./sites-1.json"
const solr = require("../../lib/solr")
const pdf = require("pdf-parse")

export const crawlee = () => {
  console.log("Crawler started!")
  let dataDir = process.env.DATA_DIR || "/"

  var fs = require("fs")
  const crawlDir = `${dataDir}/crawlee`
  const screens = `${crawlDir}/screens`

  if (!fs.existsSync(screens)) {
    fs.readdirSync(crawlDir).forEach((f) => fs.rmSync(`${crawlDir}/${f}`))
    fs.mkdirSync(screens, { recursive: true })
  }

  var obj = {
    table: [],
  }

  const crawler = new PlaywrightCrawler({
    launchContext: {
      // Here you can set options that are passed to the playwright .launch() function.
      launchOptions: {
        headless: true,
      },
    },
    maxRequestsPerCrawl: 100,
    preNavigationHooks: [
      async (crawlingContext) => {
        const { page, request, route } = crawlingContext
        function getExtensionFromUrl(url) {
          var extension = ""
          var pattern = /\.([0-9a-z]+)(?:[\?#]|$)/i
          if (url.match(pattern) && url.match(pattern)[1]) {
            extension = url.match(pattern)[1]
          }
          return extension
        }
        const ext = getExtensionFromUrl(request.url)
        if (ext === "pdf") {
          await playwrightUtils.blockRequests(page)
          request.noRetry = true
          console.log("Crawlee pdf Request cancelled.")
          console.log(ext, request.url, route)
          const pdfResponse = await fetch(request.url)
          const pdfBuffer = await pdfResponse.arrayBuffer()
          const pdfBinary = Buffer.from(pdfBuffer)
          pdf(pdfBinary).then(function (data) {
            obj.table.push({
              title: "",
              doc_type: "pdf",
              content_type: "",
              url: request.url,
              description: "",
              keywords: "",
              main_content: data.text,
              category: "",
              unit_name: "",
              full_content: "",
              charset: "utf8",
            })
            var json = JSON.stringify(obj, null, 4)
            fs.writeFile(`${crawlDir}/documents.json`, json, (error) => {
              if (error) {
                console.log("An error has occurred ", error)
                return
              }
            })
          })
        }
      },
    ],
    async requestHandler({ request, page, enqueueLinks, log }) {
      log.info(`Processing ${request.url}...`)
      try {
        const metaTags = await page.locator("meta")
        const count = await metaTags.count()
        let metas = []

        for (let i = 0; i < count; ++i) {
          let metaAtts: any = {}
          const item = metaTags.nth(i)
          metaAtts.name = await item.getAttribute("name")
          metaAtts.content = await item.getAttribute("content")
          metaAtts.httpEquiv = await item.getAttribute("http-equiv")
          metaAtts.charset = await item.getAttribute("charset")
          metas.push(metaAtts)
        }

        const mainContent = await page.evaluate(() => {
          for (const script of document.body.querySelectorAll("script"))
            script.remove()
          for (const style of document.body.querySelectorAll("style"))
            style.remove()
          for (const img of document.body.querySelectorAll("img")) img.remove()
          return document.body.textContent
        })
        const title = await page.evaluate(() => document.title)

        const description =
          metas.filter((item) => {
            return item.name === "description"
          })[0]?.content || ""
        const charset =
          metas.filter((item) => {
            return item.httpEquiv === "Content-Type"
          })[0]?.content ||
          metas.filter((item) => {
            return item.charset
          })[0]?.charset ||
          ""
        obj.table.push({
          title,
          doc_type: "web page",
          content_type: "",
          url: request.url,
          description,
          keywords: "",
          main_content: mainContent,
          category: "",
          unit_name: "",
          full_content: "",
          charset,
          metas,
        })
      } catch (err) {
        console.log("Error")
        console.log(err)
      }

      // Store the results to the default dataset.
      await Dataset.pushData(obj)
      var json = JSON.stringify(obj, null, 4)
      fs.writeFile(`${crawlDir}/documents.json`, json, (error) => {
        if (error) {
          console.log("An error has occurred ", error)
          return
        }
      })
      var client = solr.createClient()
      var query = "*:*"
      client.query(query, function (err, response) {
        if (err) throw err
        var responseObj = JSON.parse(response)
        console.log(
          'A search for "' +
            query +
            '" returned ' +
            responseObj.response.numFound +
            " documents.",
        )
        console.log("First doc title: " + responseObj.response.docs[0].title)
        console.log("Second doc title: " + responseObj.response.docs[1].title)
        // client.del(null, query, function(err, response) {
        //   if (err) throw err;
        //   console.log('Deleted all docs matching query "' + query + '"');
        //   client.commit()
        // });
      })
      // Find a link to the next page and enqueue it if it exists.
      const infos = await enqueueLinks()

      if (infos.processedRequests.length === 0)
        log.info(`${request.url} is the last page!`)
    },

    // This function is called if the page processing failed more than maxRequestRetries+1 times.
    failedRequestHandler({ request, log }) {
      log.info(`Request ${request.url} failed too many times.`)
    },
  })

  ;(async () => {
    await crawler.addRequests(sites)
    // Run the crawler and wait for it to finish.
    await crawler.run()
    console.log("Crawler finished!")
  })().catch((err) => {
    console.error(err)
  })
}

parentPort.postMessage(crawlee())

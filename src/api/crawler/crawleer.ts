import { /*Dataset,*/ PuppeteerCrawler, puppeteerUtils } from "crawlee"
import { parentPort } from "worker_threads"
import {
  getExtensionFromUrl,
  getContentType,
  // getCategories,
} from "./utils/helpers"
import sites from "../../../data/sites-1.json"
const solr = require("../../lib/solr")
const pdf = require("pdf-parse")

export const crawleer = () => {
  console.log("Crawler started!")
  const client = solr.createClient()
  client.del(null, "*:*", function (err /*, response*/) {
    if (err) throw err
    console.log('Deleted all docs matching query "' + "*:*" + '"')
    client.commit()
  })
  var fs = require("fs")
  var dataDir = "/usr/src/app/data/crawlee"
  var screens = `${dataDir}/screens`
  // getCategories(`${__dirname}/website_category_listing.xlsx`, dataDir)

  if (!fs.existsSync(screens)) {
    fs.readdirSync(dataDir).forEach((f) => fs.rmSync(`${dataDir}/${f}`))
    fs.mkdirSync(screens, { recursive: true })
  }

  var obj = {
    table: [],
  }

  const crawler = new PuppeteerCrawler({
    launchContext: {
      launchOptions: {
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    },
    maxRequestsPerCrawl: 100000,
    preNavigationHooks: [
      async (crawlingContext) => {
        const { /*page,*/ request } = crawlingContext

        const ext = getExtensionFromUrl(request.url)
        if (ext === "pdf") {
          request.noRetry = true
          const pdfResponse = await fetch(request.url)
          const pdfBuffer = await pdfResponse.arrayBuffer()
          const pdfBinary = Buffer.from(pdfBuffer)
          pdf(pdfBinary).then(function (data) {
            const newDoc = {
              title: "",
              doc_type: "pdf",
              content_type: getContentType(request.url),
              url: request.url,
              description: "",
              keywords: "",
              main_content: data.text.replace(/\0/g, ""),
              category: "Category",
              unit_name: "Unit name",
              full_content: "",
              // charset: "utf8"
            }

            // client.add(newDoc, function (err, response) {
            //   if (err) throw err
            //   let yep = `Added pdf to solr: ${request.url}`
            //   let nope = `Issue adding ${request.url} to solr. Seek Help!`
            //   console.log(client.getStatus(response) ? yep : nope)
            // })
            obj.table.push(newDoc)
            var json = JSON.stringify(obj, null, 4)
            fs.writeFile(`${dataDir}/documents.json`, json, (error) => {
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
      const ext = getExtensionFromUrl(request.url)
      if (ext === "pdf") {
        await puppeteerUtils.blockRequests(page)
        return
      }
      log.info(`Processing ${request.url}...`)
      try {
        const mainContent = await page.evaluate(() => {
          for (const script of document.body.querySelectorAll("script"))
            script.remove()
          for (const style of document.body.querySelectorAll("style"))
            style.remove()
          for (const img of document.body.querySelectorAll("img")) img.remove()
          return document.body.textContent
        })
        const title = await page.evaluate(() => document.title)

        const metas = await page.evaluate(() => {
          let metaTags = []
          let metaTs = document.querySelectorAll("meta")
          for (let i = 0; i < metaTs.length; ++i) {
            let metaAtts: any = {}
            const item = metaTs[i]
            metaAtts.name = item.getAttribute("name")
            metaAtts.content = item.getAttribute("content")
            metaAtts.httpEquiv = item.getAttribute("http-equiv")
            metaAtts.charset = item.getAttribute("charset")
            metaTags.push(metaAtts)
          }
          return metaTags
        })

        const description =
          metas.filter((item) => {
            return item.name === "description"
          })[0]?.content || ""
        // const charset =
        //   metas.filter((item) => {
        //     return item.httpEquiv === "Content-Type"
        //   })[0]?.content ||
        //   metas.filter((item) => {
        //     return item.charset
        //   })[0]?.charset ||
        //   ""
        const newDoc = {
          title,
          doc_type: "web page",
          content_type: getContentType(request.url),
          url: request.url,
          description,
          keywords: "",
          main_content: mainContent,
          category: "Category",
          unit_name: "Unit name",
          full_content: "",
          // charset,
          // metas
        }
        obj.table.push(newDoc)
        await client.add(newDoc, function (err, response) {
          if (err) throw err
          let yep = `Added page to solr: ${request.url}`
          let nope = `Issue adding ${request.url} to solr. Seek Help!`
          console.log(client.getStatus(response) ? yep : nope)
        })
      } catch (err) {
        console.log("Error")
        console.log(err)
      }

      // Store the results to the default dataset.
      // await Dataset.pushData(obj)
      var json = JSON.stringify(obj, null, 4)
      fs.writeFile(`${dataDir}/documents.json`, json, (error) => {
        if (error) {
          console.log("An error has occurred ", error)
          return
        }
      })

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

    await client.swap(function (err /*, response*/) {
      if (err) throw err
      console.log("cores swapped")
    })
    console.log("Crawler finished!")
  })().catch((err) => {
    console.error(err)
  })
}

parentPort.postMessage(crawleer())

import { Dataset, PuppeteerCrawler, puppeteerUtils } from "crawlee"
import { parentPort } from "worker_threads"
import {
  getExtensionFromUrl,
  getContentType,
  getCategories,
  cleanUrl,
  getImageData
} from "./utils/helpers"
import { swap, client } from "./solr"
import sites from "./sites-1.json"
const pdf = require("pdf-parse")
require("dotenv").config()

export const crawleer = () => {
  console.log("Crawler started!")
  console.log("Data dir: " + process.env.DATA_DIR)
  let dataDir = process.env.DATA_DIR || "/"

  client.delete(null, "*:*", function (err /*, response*/) {
    if (err) throw err
    console.log('Deleted all docs matching query "' + "*:*" + '"')
    client.commit()
  })
  var fs = require("fs")
  const crawlDir = `${dataDir}/crawleer`
  const screens = `${crawlDir}/screens`
  const cats = getCategories(
    `${__dirname}/website_category_listing.xlsx`,
    crawlDir
  )

  if (!fs.existsSync(screens)) {
    fs.readdirSync(crawlDir).forEach((f) => fs.rmSync(`${crawlDir}/${f}`))
    fs.mkdirSync(screens, { recursive: true })
  }

  // var obj = {
  //   table: []
  // }

  const contentTypes = [
    { name: "pdf", extensions: ["pdf"] },
    { name: "image", extensions: ["jpg", "png", "gif"] },
    { name: "document", extensions: ["doc", "docx", "docm", "odt"] },
    { name: "spreadsheet", extensions: ["xls", "xlsx"] },
    { name: "powerpoint", extensions: ["ppt", "pptx"] },
    { name: "web page", extensions: ["html", "htm", "asp", "aspx", "php"] },
    { name: "sound", extensions: ["mp3"] },
    { name: "video", extensions: ["mp4"] }
  ]
  const mediaExts = []
  contentTypes
    .filter((item) => {
      return item.name !== "web page"
    })
    .map((item) => item.extensions.map((item1) => mediaExts.push(item1)))
  // console.log(mediaExts)
  // const config = Configuration.getGlobalConfig()

  // config.set("memoryMbytes", 6000)

  // console.log(config.get("memoryMbytes"))
  const crawler = new PuppeteerCrawler({
    launchContext: {
      launchOptions: {
        // https://github.com/puppeteer/puppeteer/issues/1813 // false, no work
        headless: true, // maybe "new"
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        // timeout: 0
      }
    },
    maxRequestsPerCrawl: 100000,
    // navigationTimeoutSecs: 20,
    maxRequestRetries: 1,
    preNavigationHooks: [
      async (crawlingContext) => {
        const { /*page,*/ request } = crawlingContext

        const ext = getExtensionFromUrl(request.url)

        // TODO: put in helper function
        const catunit = cats.filter((cat) => {
          return cleanUrl(request.url).startsWith(cat.site)
        })[0]
        const pdfTypes = contentTypes.filter((item) => {
          return item.name === "pdf"
        })[0].extensions
        const imageTypes = contentTypes.filter((item) => {
          return item.name === "image"
        })[0].extensions

        let newDoc = {
          title: "",
          doc_type: "",
          content_type: getContentType(request.url),
          url: request.url,
          description: "",
          keywords: "",
          main_content: "",
          category: catunit?.cat || "Other",
          unit_name: catunit?.unit || "Other",
          full_content: ""
          // charset: "utf8"
        }

        if (pdfTypes.includes(ext)) {
          request.noRetry = true
          const pdfResponse = await fetch(request.url)
          const pdfBuffer = await pdfResponse.arrayBuffer()
          const pdfBinary = Buffer.from(pdfBuffer)
          pdf(pdfBinary)
            .then(function (data) {
              newDoc.doc_type = "pdf"
              newDoc.main_content = JSON.stringify(data.text.replace(/\0/g, ""))

              client.add(newDoc, function (err, response) {
                if (err) throw err
                let yep = `Added pdf to solr: ${request.url}`
                let nope = `Issue adding ${request.url} to solr. Seek Help!`
                console.log(client.getStatus(response) ? yep : nope)
                // client.commit()
              })
              // obj.table.push(newDoc)
              // var json = JSON.stringify(obj, null, 4)
              // fs.writeFile(`${crawlDir}/documents.json`, json, (error) => {
              //   if (error) {
              //     console.log("An error has occurred ", error)
              //     return
              //   }
              // })
            })
            .catch((err) => console.log(err))
        }

        if (imageTypes.includes(ext)) {
          newDoc.doc_type = "image"
          newDoc.main_content = JSON.stringify(
            await getImageData(request.url, null)
          )

          client.add(newDoc, function (err, response) {
            if (err) throw err
            let yep = `Added image to solr: ${request.url}`
            let nope = `Issue adding ${request.url} to solr. Seek Help!`
            console.log(client.getStatus(response) ? yep : nope)
            // client.commit()
          })
        }
      }
    ],
    async requestHandler({ request, page, enqueueLinks, log }) {
      const ext = getExtensionFromUrl(request.url)
      if (mediaExts.includes(ext)) {
        await puppeteerUtils.blockRequests(page)
        return
      }
      log.info(`Processing ${request.url}...`)

      // TODO: put in helper function
      const catunit = cats.filter((cat) => {
        return cleanUrl(request.url).startsWith(cat.site)
      })[0]

      try {
        const hitContent = await page.content()
        const fullContent = await page.evaluate(() => {
          return (
            new XMLSerializer().serializeToString(document.doctype) +
            document.querySelector("*").outerHTML
          )
        })
        const fullText = await page.evaluate(() => {
          for (const script of document.body.querySelectorAll("script"))
            script.remove()
          for (const style of document.body.querySelectorAll("style"))
            style.remove()
          for (const img of document.body.querySelectorAll("img")) img.remove()
          return document.body.textContent
        })
        const extractedText = await page.$eval("*", (el) => {
          const selection = window.getSelection()
          const range = document.createRange()
          range.selectNode(el)
          selection.removeAllRanges()
          selection.addRange(range)
          return window.getSelection().toString()
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
            metaAtts.keywords = item.getAttribute("keywords")
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
        const keywords =
          metas.filter((item) => {
            return item.name === "keywords"
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
          doc_type:
            hitContent === fullContent ? "static web page" : "dynamic web page",
          content_type: getContentType(request.url),
          url: request.url,
          description,
          keywords,
          main_content: JSON.stringify(extractedText),
          full_content: JSON.stringify(fullText),
          category: catunit?.cat || "Other",
          unit_name: catunit?.unit || "Other"
          // charset,
          // metas
        }
        // obj.table.push(newDoc)
        // Store the results to the default dataset.
        await Dataset.pushData(newDoc)

        await client.add(newDoc, function (err, response) {
          if (err) throw err
          let yep = `Added page to solr: ${request.url}`
          let nope = `Issue adding ${request.url} to solr. Seek Help!`
          console.log(client.getStatus(response) ? yep : nope)
          // client.commit()
        })
      } catch (err) {
        console.log("Error")
        console.log(err)
      }

      // var json = JSON.stringify(obj, null, 4)
      // fs.writeFile(`${crawlDir}/documents.json`, json, (error) => {
      //   if (error) {
      //     console.log("An error has occurred ", error)
      //     return
      //   }
      // })

      const infos = await enqueueLinks()

      if (infos.processedRequests.length === 0)
        log.info(`${request.url} is the last page!`)
    },

    // This function is called if the page processing failed more than maxRequestRetries+1 times.
    failedRequestHandler({ request, log }) {
      log.info(`Request ${request.url} failed too many times.`)
    }
  })

    ; (async () => {
    await crawler.addRequests(sites)
    // Run the crawler and wait for it to finish.
    await crawler.run()
    await swap()
    client.commit()
    console.log("Crawler finished!")
  })().catch((err) => {
    console.error(err)
  })
}

parentPort.postMessage(crawleer())

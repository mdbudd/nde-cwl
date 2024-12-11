import xlsx from "node-xlsx"
import { ExifImage } from "exif"

var fs = require("fs")
export const getExtensionFromUrl = (url) => {
  var extension = ""
  var pattern = /\.([0-9a-z]+)(?:[\?#]|$)/i
  if (url.match(pattern) && url.match(pattern)[1]) {
    extension = url.match(pattern)[1]
  }
  return extension
}

export const cleanUrl = (url) => {
  return url !== undefined
    ? url.replace(/http(s)?(:)?(\/\/)?|(\/\/)?(www(2)?\.)?/g, "")
    : url
}

export const getContentType = (url) => {
  let contentType = ""
  let cleanedUrl = cleanUrl(url)
  if (cleanedUrl.includes("example.co.uk/news/")) {
    contentType = "News"
  }
  if (cleanedUrl.includes("example.co.uk/events/")) {
    contentType = "Events"
  }
  if (
    cleanedUrl.includes("example.co.uk/blogs/") ||
    cleanedUrl.includes("example.co.uk/blog/")
  ) {
    contentType = "Blogs"
  }

  if (cleanedUrl.includes("example.co.uk/help/")) {
    contentType = "Help"
  }
  return contentType
}

export const getCategories = (file, dest) => {
  const workSheetsFromFile = xlsx.parse(file)
  let sites = workSheetsFromFile[1].data.filter((e) => e.length)
  sites.splice(0, 2)

  let cats = sites.map((cat) => {
    return { site: cleanUrl(cat[0]), cat: cat[2], unit: cat[4] }
  })

  // let json = JSON.stringify(cats, null, 4)
  // fs.writeFile(`${dest}/sheets.json`, json, (error) => {
  //   if (error) {
  //     console.log("An error has occurred ", error)
  //     return
  //   }
  // })

  return cats
}

export const getImageData = async (image, dest) => {
  let img = { message: "None" }
  let fimg = await fetch(image)
  image = Buffer.from(await fimg.arrayBuffer())
  return new Promise(function (resolve, reject) {
    try {
      new ExifImage({ image }, async function (error, exifData) {
        if (error) {
          console.log("Error getting image: " + error.message)
          img.message = error.message
          resolve(img)
        } else {
          img = exifData
        } // Do something with your data!
        resolve(img)
      })
    } catch (error) {
      console.log("Error getting image: " + error.message)
      img.message = error.message
      resolve(img)
    }
  })
}

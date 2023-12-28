import xlsx from "node-xlsx"

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
  return url.replace(/^(?:https?:\/\/)?(?:www\.)|(\/)/gi, "")
}

export const getContentType = (url) => {
  let contentType = ""
  let cleanedUrl = cleanUrl(url)
  if (cleanedUrl.includes("co.uk/news/")) {
    contentType = "News"
  }
  if (cleanedUrl.includes("co.uk/events/")) {
    contentType = "Events"
  }
  if (
    cleanedUrl.includes("co.uk/blogs/") ||
    cleanedUrl.includes("co.uk/blog/")
  ) {
    contentType = "Blogs"
  }

  if (cleanedUrl.includes("co.uk/funding/")) {
    contentType = "Funding"
  }
  return contentType
}
export const getCategories = (file, dest) => {
  const workSheetsFromFile = xlsx.parse(file)

  var json = JSON.stringify(workSheetsFromFile, null, 4)
  fs.writeFile(`${dest}/sheets.json`, json, (error) => {
    if (error) {
      console.log("An error has occurred ", error)
      return
    }
  })
}

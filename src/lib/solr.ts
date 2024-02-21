var http = require("http")
var querystring = require("querystring")
var util = require("util")
var events = require("events")
var auth = Buffer.from(process.env.SOLR_USER1 || "").toString("base64")

var DEFAULTS = {
  host: process.env.SOLR_HOST || "",
  port: process.env.SOLR_PORT || "",
  core: "/sch_rebuild", // if defined, should begin with a slash
  path: "/solr", // should also begin with a slash
  authorization: "Basic " + auth,
}

// Helper functions

// callback || noop borrowed from node/lib/fs.js
function noop() {}

function escapeXml(str) {
  return str
    .replace(/&/gm, "&amp;")
    .replace(/</gm, "&lt;")
    .replace(/>/gm, "&gt;")
    .replace(/\'/gm, "&apos;")
    .replace(/\"/gm, "&quot;")
}

function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      if (typeof a[key] == "undefined") {
        a[key] = b[key]
      } else if (typeof a[key] == "object" && typeof b[key] == "object") {
        a[key] = merge(a[key], b[key])
      }
    }
  }
  return a
}

/**
 * Convert the field, value and params into an XML entity
 * @param  {string} field  Name of the field
 * @param  {string} value  Field value
 * @param  {Object} params Optional set of paramaters, key/value set
 * @return {string}        String with the field to be added to the XML document
 */
function serializeScalar(field, value, params) {
  var fieldParams = ""
  params = typeof params !== "undefined" ? params : ""
  if (params && typeof params === "object") {
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        fieldParams += " " + key + '="' + params[key] + '"'
      }
    }
  }
  value = "" + value
  var fieldXML =
    '<field name="' +
    field +
    '"' +
    fieldParams +
    ">" +
    escapeXml(value) +
    "</field>"
  return fieldXML
}

/**
 * Convert a list of values into a string to be added to the XML main document
 * @param  {string} field Field name
 * @param  {Array} list   List or sub-values
 * @param  {Object} params Optional set of paramaters, key/value set
 * @return {string}       XML elements to be added to the main XML document
 */
function serializeList(field, list, params) {
  var data = ""
  if (!Array.isArray(list)) {
    return data
  }

  list.forEach(function (value) {
    if (!Array.isArray(value)) {
      data += serializeScalar(field, value, params)
    }
  })
  return data
}

function Client(options) {
  options = options || {}
  this.options = merge(options, DEFAULTS)
  this.aliases = {}
  this.schLive = "sch_a"
  this.schRebuild = "sch_b"
}

export {}

util.inherits(Client, events.EventEmitter)

Client.prototype.request = function (options, callback) {
  var client = this
  options = options || {}
  options = merge(options, client.options)
  if (!options.headers) options.headers = {}
  options.headers.host = options.host + ":" + options.port
  options.headers.Authorization = options.authorization
  var buffer = ""
  var request = http.request(options, function (response) {
    response.on("data", function (chunk) {
      buffer += chunk
    })
    response.on("end", function () {
      if (response.statusCode !== 200) {
        var err = new Error(exports.getError(buffer))
        // err.headers = { status: response.statusCode }
        callback(err)
      } else {
        callback(null, buffer)
      }
    })
  })
  request.on("error", function (e) {
    client.emit("error", e)
    callback(e)
  })
  if (options.data) {
    request.write(options.data, options.requestEncoding || "utf8")
  }
  request.end()
}

Client.prototype.get = function (getPath, callback) {
  var options = {
    method: "GET",
    path: this.options.path + this.options.core + "/" + getPath
  }
  this.request(options, callback || noop)
}

Client.prototype.post = function (postPath, data, callback) {
  var options = {
    method: "POST",
    path: this.options.path + this.options.core + "/" + postPath,
    headers: {
      "Content-Length": Buffer.byteLength(data),
      "Content-Type": "text/xml"
    },
    data: data
  }
  this.request(options, callback || noop)
}

Client.prototype.update = function (data, callback) {
  this.post("update", data, callback)
}

Client.prototype.add = function (doc, options, callback) {
  if (callback === undefined) {
    callback = options
    options = {}
  }
  options = options || {}
  var addParams: any = {}
  if (options.overwrite !== undefined) {
    addParams.overwrite = Boolean(options.overwrite)
  }
  if (options.commitWithin !== undefined) {
    addParams.commitWithin = options.commitWithin
  }
  if (options.commit !== undefined) {
    addParams.commit = Boolean(options.commit)
  }
  var data = "<add>"
  var docs = Array.isArray(doc) ? doc : [doc]
  for (var i = 0; i < docs.length; i++) {
    data += "<doc>"
    var doc = docs[i]
    for (var field in doc)
      if (doc.hasOwnProperty(field)) {
        var value = doc[field]
        var params = null
        switch (true) {
          case !Array.isArray(value) && typeof value !== "object":
            data += serializeScalar(field, value, undefined)
            break
          case !Array.isArray(value) && typeof value === "object":
            params = value.params
            if (Array.isArray(value.value)) {
              data += serializeList(field, value.value, params)
            } else {
              data += serializeScalar(field, value.value, params)
            }
            break
          case typeof value === "object":
            data += serializeScalar(field, value, undefined)
            break
          default:
            data += serializeList(field, value, undefined)
        }
      }
    data += "</doc>"
  }
  data += "</add>"
  this.update(data, callback)
}

Client.prototype.delete = function (id, query, callback) {
  var data = "<delete>"
  if (id) {
    if (Array.isArray(id)) {
      for (var i = 0; i < id.length; i++) {
        data = data + "<id>" + id[i] + "</id>"
      }
    } else {
      data = data + "<id>" + id + "</id>"
    }
  }
  if (query) {
    if (Array.isArray(query)) {
      for (var i = 0; i < query.length; i++) {
        data = data + "<query>" + query[i] + "</query>"
      }
    } else {
      data = data + "<query>" + query + "</query>"
    }
  }
  data = data + "</delete>"
  this.update(data, callback)
}

Client.prototype.query = function (query, options, callback) {
  if (callback === undefined) {
    callback = options
    options = {}
  }
  var queryParams = options || {}
  queryParams.q = query
  queryParams.wt = "json"
  this.get("select?" + querystring.stringify(queryParams), callback)
}

Client.prototype.commit = function (callback) {
  var data = "<commit/>"
  this.update(data, callback)
}

Client.prototype.optimize = function (callback) {
  var data = "<optimize/>"
  this.update(data, callback)
}

Client.prototype.rollback = function (callback) {
  var data = "<rollback/>"
  this.update(data, callback)
}

Client.prototype.swap = async function (callback) {
  var options = {
    method: "GET",
    path:
      this.options.path +
      "/admin/cores?action=SWAP&core=" +
      this.options.core.replace("/", "") +
      "&&other=sch_live"
  }
  await this.request(options, callback || noop)
}

Client.prototype.assAlias = async function (alias, coll, callback) {
  const options = {
    method: "GET",
    path: `${this.options.path}/admin/collections?action=CREATEALIAS&name=${alias}&collections=${coll}`
  }
  await this.request(options, callback || noop)
}
Client.prototype.swapCols = async function () {
  console.log(this.schLive, this.schRebuild)
  const setAliases = (args) => {
    this.aliases = args.aliases
    this.assAlias(
      "sch_live",
      this.aliases.sch_rebuild,
      function (err, response) {
        if (err) throw err
        console.log(response)
      }
    )
    this.assAlias(
      "sch_rebuild",
      this.aliases.sch_live,
      function (err, response) {
        if (err) throw err
        console.log(response)
      }
    )
    console.log(this.aliases)
  }
  this.request(
    {
      method: "GET",
      path: `${this.options.path}/admin/collections?action=LISTALIASES`
    },
    function (err, response) {
      if (err) throw err
      let aliases = { sch_rebuild: "sch_a", sch_live: "sch_b" }
      setAliases({ aliases: JSON.parse(response).aliases || aliases })
    }
  )

  // obj)
}

Client.prototype.reload = function (callback) {
  var options = {
    method: "GET",
    path:
      this.options.path +
      "/admin/cores?action=RELOAD&core=" +
      this.options.core.replace("/", "")
  }
  this.request(options, callback || noop)
}
// parse status from xml response
Client.prototype.getStatus = function (statusMessage) {
  if (!statusMessage) {
    return 1
  }
  var statusTag = '<int name="status">'
  return statusMessage.charAt(
    statusMessage.indexOf(statusTag) + statusTag.length
  )
}

// parse error from html response
exports.getError = function (errorMessage) {
  var err = errorMessage.match(/<pre>([\s\S]+)<\/pre>/)
  return (err || ["", errorMessage])[1].trim()
}

// escape dangerous characters in query values
exports.valueEscape = function (query) {
  return query.replace(/\\?([&|+\-!(){}[\]^"~*?\:]{1})/g, function (str, c) {
    return "\\" + c
  })
}

// main export function
exports.createClient = function (options) {
  var client = new Client(options)
  return client
}

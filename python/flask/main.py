from api.app import app, api, docs
from resources.awesome import AwesomeAPI
from resources.crawler import Crawler
# from resources.scraper import Scraper
from resources.scraper2 import Scraper

api.add_resource(AwesomeAPI, "/awesome")
docs.register(AwesomeAPI)

api.add_resource(Crawler, "/crawl")
docs.register(Crawler)

api.add_resource(Scraper, "/scrape")
docs.register(Scraper)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", use_reloader=True, port=8001)

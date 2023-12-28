import crochet

crochet.setup()  # initialize crochet before further imports

from flask import Flask, jsonify
from scrapy import signals
from scrapy.crawler import CrawlerRunner
from scrapy.signalmanager import dispatcher

from spiders import example


app = Flask(__name__)
output_data = []
crawl_runner = CrawlerRunner()
# crawl_runner = CrawlerRunner(get_project_settings()) if you want to apply settings.py


@app.route("/scrape")
def scrape():
    # run crawler in twisted reactor synchronously
    scrape_with_crochet()

    return jsonify(output_data)


@crochet.wait_for(timeout=60.0)
def scrape_with_crochet():
    # signal fires when single item is processed
    # and calls _crawler_result to append that item
    dispatcher.connect(_crawler_result, signal=signals.item_scraped)
    # eventual = crawl_runner.crawl(example.ToScrapeSpiderXPath)
    eventual = crawl_runner.crawl(example.ToScrapeSpiderJson)
    return eventual  # returns a twisted.internet.defer.Deferred


def _crawler_result(item, response, spider):
    """
    We're using dict() to decode the items.
    Ideally this should be done using a proper export pipeline.
    """
    output_data.append(dict(item))


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", use_reloader=True)

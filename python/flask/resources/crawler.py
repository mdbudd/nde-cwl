from flask import Flask, jsonify
from flask_restful import Resource
from marshmallow import Schema, fields
from flask_apispec.views import MethodResource
from flask_apispec import marshal_with, doc, use_kwargs

import crochet
from scrapy import signals
from scrapy.crawler import CrawlerRunner
from scrapy.signalmanager import dispatcher

from spiders import example, dynamic

crochet.setup()  # initialize crochet before further imports
output_data = []
crawl_runner = CrawlerRunner()
# crawl_runner = CrawlerRunner(get_project_settings()) if you want to apply settings.py


@crochet.run_in_reactor
def scrape_with_crochet():
    # signal fires when single item is processed
    # and calls _crawler_result to append that item
    dispatcher.connect(_crawler_result, signal=signals.item_scraped)
    # eventual = crawl_runner.crawl(example.ToScrapeSpiderXPath)
    # eventual = crawl_runner.crawl(example.ToScrapeSpiderJson)
    # eventual = crawl_runner.crawl(example.MySpider)
    # eventual = crawl_runner.crawl(dynamic.PwspiderSpider)
    eventual = crawl_runner.crawl(dynamic.AwesomeSpider)
    return eventual  # returns a twisted.internet.defer.Deferred


def _crawler_result(item, response, spider):
    """
    We're using dict() to decode the items.
    Ideally this should be done using a proper export pipeline.
    """
    output_data.append(dict(item))


class Crawler(MethodResource, Resource):
    @doc(description="Scrape some sites.", tags=["Crawler"])
    # @marshal_with(AwesomeResponseSchema)  # marshalling
    def get(self):
        # run crawler in twisted reactor synchronously
        scrape_with_crochet()
        return jsonify(output_data)

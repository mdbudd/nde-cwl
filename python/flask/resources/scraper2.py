from flask import Flask
from flask_restful import Resource
from marshmallow import Schema, fields
from flask_apispec.views import MethodResource
from flask_apispec import marshal_with, doc, use_kwargs
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import time
import json


class ScraperResponseSchema(Schema):
    message = fields.Str(default="Success")


class ScraperRequestSchema(Schema):
    api_type = fields.String(required=True, description="API type of scaper API")


def scrape():
    data = []
    urls = [
        "https://www.periplus.com/recommendations/Bestseller+Business",
        "https://www.webegg.co.uk",
        "https://www.webegg.co.uk/blog/the-evolution-of-sass",
    ]
    for url in urls:
        # running playwright go to web
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(url, timeout=120000)
            time.sleep(1)

            # Scraping data with BeautfilSoup
            data_html = page.inner_html("body")
            soup = BeautifulSoup(data_html, "html.parser")
            main_content = soup.get_text()
            # books = soup.find_all("div", {"class": "single-product"})
            # for book in books:
            #     img = book.find("img", {"class": "hover-img"}).get("src")
            #     urls = book.find("a").get("href")
            #     titles = book.find("h3", {"style": "line-height:10px;height:18px;"}).text.strip()
            #     try:
            #         author = book.find("a", {"style": "font-size:11.5px"}).text.strip()
            #     except:
            #         author = "None"
            #     price = book.find("div", {"style": "font-size:100%;color:#000000;font-weight:600;"}).text.strip()
            list_data = [{"main_content": main_content}]
            data.append(list_data)

            # Save data to json
            with open("./flask/data/sample_v3.json", "w") as f:
                json.dump(data, f, indent=4)

            browser.close()


class Scraper(MethodResource, Resource):
    @doc(description="My First GET Scraper API.", tags=["Scraper"])
    @marshal_with(ScraperResponseSchema)  # marshalling
    def get(self):
        scrape()

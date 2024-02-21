import scrapy
from scrapy_playwright.page import PageMethod
import json
from time import sleep
import random


class MyItem(scrapy.Item):
    text = scrapy.Field()
    author = scrapy.Field()


class PwspiderSpider(scrapy.Spider):
    name = "test"

    def start_requests(self):

        with open("./flask/data/dyn1.json", "w") as file:
            json.dump([], file)
        yield scrapy.Request(
            url="https://shoppable-campaign-demo.netlify.app/#/",
            callback=self.parse,
            meta={
                "playwright": True,
                "playwright_page_methods": [
                    PageMethod("wait_for_selector", ".card-body"),
                ],
            },
        )

    def parse(self, response):

        products = response.xpath('//*[@class="card-body"]')
        for product in products:
            title = product.xpath('.//*[@class="card-title"]/text()').get()
            output = {"title": title}
            print(output)
            with open("./flask/data/dyn1.json", "r+") as file:
                file_data = json.load(file)
                # Join new_data with file_data inside emp_details
                file_data.append(output)
                # Sets file's current position at offset.
                file.seek(0)
                # convert back to json.
                json.dump(file_data, file, indent=4)
            yield output


class AwesomeSpider(scrapy.Spider):
    name = "scroll"

    def start_requests(self):
        yield scrapy.Request(
            url="http://quotes.toscrape.com/scroll",
            meta=dict(
                playwright=True,
                playwright_include_page=True,
                playwright_page_methods=[
                    PageMethod("wait_for_selector", "div.quote"),
                    PageMethod("evaluate", "window.scrollBy(0, document.body.scrollHeight)"),
                    PageMethod("wait_for_selector", "div.quote:nth-child(11)"),  # 10 per page
                ],
            ),
        )

    async def parse(self, response, **kwargs):
        page = response.meta["playwright_page"]
        await page.screenshot(path="quotes.png", full_page=True)
        await page.close()
        return {"quote_count": len(response.css("div.quote"))}  # quotes from several pages
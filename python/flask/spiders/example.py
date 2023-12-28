from numpy import loadtxt
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
import scrapy
from time import sleep
import csv, os, json
import random
import re


class MyItem(scrapy.Item):
    text = scrapy.Field()
    author = scrapy.Field()


class ToScrapeSpiderXPath(scrapy.Spider):
    name = "toscrape-xpath"
    start_urls = [
        "http://quotes.toscrape.com/",
    ]

    def parse(self, response):
        for quote in response.xpath('//div[@class="quote"]'):
            return MyItem(
                text=quote.xpath('./span[@class="text"]/text()').extract_first(),
                author=quote.xpath('.//small[@class="author"]/text()').extract_first(),
            )

        next_page_url = response.xpath('//li[@class="next"]/a/@href').extract_first()
        if next_page_url is not None:
            return scrapy.Request(response.urljoin(next_page_url))


class ToScrapeSpiderJson(scrapy.Spider):
    name = "toscrape-json"

    def start_requests(self):
        list = [
            "http://quotes.toscrape.com/",
        ]

        for i in list:
            yield scrapy.Request(i, callback=self.parse)
            sleep(random.randint(0, 5))

    def parse(self, response):
        quotes = []
        with open("./flask/data/quotes.json", "w") as filee:
            filee.write("[")
            for index, quote in enumerate(response.css("div.quote")):
                output = {
                    "text": quote.css("span.text::text").extract_first(),
                    "author": quote.css(".author::text").get(),
                    "tags": quote.css(".tag::text").getall(),
                }
                json.dump(output, filee, indent=4)
                if index < len(response.css("div.quote")) - 1:
                    filee.write(",")
                quotes.append(output)
            filee.write("]")
        return quotes


# Function to remove newline,tabspace and whitespace characters using RegEx
def CleanTag(textToClean):
    finaltext = []
    for text in textToClean:
        cleanText = re.sub("(\n|\t)*", "", text)
        cleanText = cleanText.strip()
        if cleanText != "":
            finaltext.append(cleanText)
    return finaltext


class ScraperItem(scrapy.Item):
    page = scrapy.Field()
    content = scrapy.Field()


class MySpider(scrapy.Spider):
    name = "MySpider"
    # Throttle crawl speed to prevent hitting site too hard
    custom_settings = {
        # "CONCURRENT_REQUESTS": 2,  # only 2 requests at the same time
        # "DOWNLOAD_DELAY": 0.5,  # delay between requests
        "DEPTH_LIMIT": 2,
    }
    rules = (Rule(LinkExtractor(), callback="parse", follow=True),)

    def start_requests(self):
        file = open("./flask/data/crawl-list2.txt", "r")
        data = file.read()
        # replacing end of line('/n') with ' ' and
        # splitting the text it further when '.' is seen.
        list = data.split("\n")

        # printing the data
        print(list)
        # list = [
        #     "http://quotes.toscrape.com/",
        # ]

        with open("./flask/data/quotes2.json", "w") as file:
            json.dump([], file)

        for i in list:
            yield scrapy.Request(i, callback=self.parse)
            # sleep(random.randint(0, 5))

    def parse(self, response):
        p_tags = response.xpath("//p/text()").extract()
        content = CleanTag(p_tags)
        content_s = " ".join(p_tags).strip()
        currentPage = response.request.url
        item = ScraperItem()
        item["page"] = currentPage
        item["content"] = content_s
        output = {
            "page": currentPage,
            "content": content_s,
        }
        print(output)
        with open("./flask/data/quotes2.json", "r+") as file:
            file_data = json.load(file)
            # Join new_data with file_data inside emp_details
            file_data.append(output)
            # Sets file's current position at offset.
            file.seek(0)
            # convert back to json.
            json.dump(file_data, file, indent=4)
        yield item

        NEXT_PAGE_SELECTOR = "a::attr(href)"
        next_pages = response.css(NEXT_PAGE_SELECTOR).extract()
        
        print(next_pages)
        approved = ['webegg.co.uk']
        next_pages[:] = [url for url in next_pages if any(sub in url for sub in approved)]
        print(next_pages)
        if next_pages:
            for next_page in next_pages:
                if "webegg.co.uk" in next_page:
                    yield scrapy.Request(response.urljoin(next_page), callback=self.parse)

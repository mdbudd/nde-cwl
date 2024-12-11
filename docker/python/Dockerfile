
FROM python:3.12 AS python
RUN mkdir /python
WORKDIR /python

COPY ./python/requirements.txt ./
ADD ./python/. /python/

RUN pip install -r ./requirements.txt
# RUN playwright install
# RUN playwright install-deps

CMD [ "python", "/python/flask/main.py" ]
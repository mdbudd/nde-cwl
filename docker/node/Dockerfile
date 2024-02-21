# Filename: Dockerfile

FROM node:18 as node


RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH google-chrome-stable

# FROM public.ecr.aws/lambda/nodejs:14.2022.09.09.11
# Create working directory
WORKDIR /usr/src/app

# Copy package.json
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY jest.config.js ./
COPY .env.api ./
COPY .env.sample ./
COPY /src/ ./

# Install NPM dependencies for function
RUN npm install
RUN npx puppeteer browsers install chrome;
# RUN npx playwright install; 
RUN npm audit fix --force;
RUN npm audit fix;
# Copy handler function and tsconfig

# configure puppeteer user
# RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#     && mkdir -p /home/pptruser/Downloads \
#     && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /node_modules

# USER pptruser

# Expose app
EXPOSE 8081

# Run app
CMD ["npm", "run", "server"]
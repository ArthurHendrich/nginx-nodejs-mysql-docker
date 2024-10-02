FROM alpine as dockerize

ENV DOCKERIZE_VERSION v0.8.0
RUN apk add --no-cache wget \
    && wget -O - https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar xzf - -C /usr/local/bin

FROM node:16-alpine

WORKDIR /usr/src/app

COPY --from=dockerize /usr/local/bin/dockerize /usr/local/bin/dockerize

RUN apk add --no-cache bash

RUN npm init -y

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 3000

CMD ["dockerize", "-wait", "tcp://db:3306", "-timeout", "50s", "node", "index.js"]
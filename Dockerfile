FROM node:14.18.2 as build

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

WORKDIR /usr/src/app/dist

# @todo: add PM2 for production build?
CMD ["node", "index.js"] 

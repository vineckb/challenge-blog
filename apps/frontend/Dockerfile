FROM node:18.17.0-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .

RUN yarn build

FROM node:18.17.0-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app ./
EXPOSE 3000

CMD ["yarn", "start"]

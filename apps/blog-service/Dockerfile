FROM node:18.17.0 AS builder

WORKDIR /usr/src/app

RUN yarn global add @nestjs/cli

COPY package*.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

FROM node:18.17.0-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/yarn.lock ./
COPY --from=builder /usr/src/app/dist ./dist

RUN yarn install --production
EXPOSE 3000

CMD ["node", "dist/main"]

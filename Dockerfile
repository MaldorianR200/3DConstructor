FROM registry.sitenn.pro/sitenn/images/node:lts-alpine3.20 as build

WORKDIR /app/src
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM registry.sitenn.pro/sitenn/images/node:lts-alpine3.20

WORKDIR /app
ENV PROJECT_NAME=sandy
COPY --from=build /app/src/dist/$PROJECT_NAME ./
CMD node server/server.mjs

FROM node:18-alpine
EXPOSE 9000

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci
COPY index.js .
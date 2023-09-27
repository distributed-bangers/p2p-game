FROM node:18-alpine
EXPOSE 8080

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci
COPY index.js .
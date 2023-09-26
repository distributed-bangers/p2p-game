FROM node:lts-alpine as build-stage

RUN mkdir -p /app
RUN mkdir -p /app/game
RUN mkdir -p /app/frontend

WORKDIR /app/game
COPY ./game .
RUN npm ci
WORKDIR /app/frontend
COPY ./frontend .
RUN npm ci
RUN npm run build

FROM nginx:stable-alpine as production-stage
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/frontend/dist /app
COPY --from=build-stage /app/game/dist/client/racoon.glb /app
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
FROM node:lts-alpine as build-stage
ENV VITE_USER_API=http://localhost:5173
ENV VITE_GAME_API=http://localhost:5173
ENV VITE_SOCKET_URL=http://localhost:5173
ENV VITE_API_VERSION=/api/v1
ENV VITE_TOKEN_SECRET=4ecb7c5a013cf78fd10bcc91b8ff73f779b77fa500f03c4485831bcd5c8601af

RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM nginx:stable-alpine as production-stage
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/dist /app
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
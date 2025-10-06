# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --production --silent

COPY . .

EXPOSE 2108

USER node

CMD ["node", "src/index.js"]

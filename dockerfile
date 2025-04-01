FROM node:21-bullseye

WORKDIR /usr/src/users_microservice

COPY package.json ./
COPY package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

FROM node:12-alpine3.14
WORKDIR /app
COPY package.json /app
RUN npm i && npm cache clean --force
COPY . /app
EXPOSE 80
EXPOSE 443
EXPOSE 53
